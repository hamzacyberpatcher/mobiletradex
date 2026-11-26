/**
 * Google Places loader for the listing page. The key is a browser key in
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (see .env.example). Without it `mapsEnabled`
 * is false and the page falls back to typing the place by hand.
 */
import { pkCities, type Box } from "@/data/listing";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const mapsEnabled = !!KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;
let loading: Promise<void> | null = null;

function loadScript() {
  loading ??= new Promise<void>((resolve, reject) => {
    const w = window as G;
    if (w.google?.maps?.importLibrary) return resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY!)}&v=weekly&loading=async&language=en&region=PK`;
    s.async = true;
    // with loading=async, importLibrary appears a moment after the script's load event
    s.onload = () => {
      const t0 = Date.now();
      const wait = () => {
        if (typeof w.google?.maps?.importLibrary === "function") resolve();
        else if (Date.now() - t0 > 8000) {
          loading = null;
          reject(new Error("Google Maps did not initialise (check the API key and its allowed referrers)"));
        } else setTimeout(wait, 50);
      };
      wait();
    };
    s.onerror = () => {
      loading = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Resolves with the Places library (has PlaceAutocompleteElement). */
export async function loadPlaces(): Promise<G> {
  if (!KEY) throw new Error("No Google Maps key");
  await loadScript();
  return (window as G).google.maps.importLibrary("places");
}

const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");

/** Thrown with a message that can be shown to the seller as is. */
export class CityError extends Error {}

const notFound = (text: string) =>
  new CityError(`We could not find "${text.trim()}" in Pakistan. Check the spelling, or pick the nearest big city.`);

/**
 * Checks that `text` is a city in Pakistan and returns its proper name and,
 * with Google Places on, its outline (used to limit the meetup search).
 */
export async function resolveCity(text: string): Promise<{ name: string; box: Box | null }> {
  const q = norm(text);
  if (q.length < 3) throw notFound(text);

  if (mapsEnabled) {
    try {
      const { Place } = await loadPlaces();
      const { places } = await Place.searchByText({
        textQuery: `${text.trim()}, Pakistan`,
        fields: ["displayName", "addressComponents", "viewport"],
        includedType: "locality",
        maxResultCount: 1,
        region: "pk",
      });
      const p = places?.[0];
      if (!p) throw notFound(text);
      const country = p.addressComponents?.find((c: { types: string[] }) => c.types.includes("country"));
      if (country && country.shortText !== "PK") throw new CityError(`"${text.trim()}" is not in Pakistan. MobileTradeX only works for sellers in Pakistan.`);
      const name: string = p.displayName ?? text.trim();
      // the text search is fuzzy: reject a result that is a different place
      if (!norm(name).includes(q) && !q.includes(norm(name))) throw notFound(text);
      return { name, box: p.viewport?.toJSON() ?? null };
    } catch (e) {
      if (e instanceof CityError) throw e;
      // Google unavailable: fall through to the built-in list
    }
  }

  const hit = pkCities.find((c) => norm(c) === q);
  if (!hit) throw notFound(text);
  return { name: hit, box: null };
}
