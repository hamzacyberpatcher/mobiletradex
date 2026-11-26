"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import type { Box } from "@/data/listing";
import { CityError, loadPlaces, mapsEnabled, resolveCity } from "@/lib/maps";
import { Check, inputCls } from "./ui";

/**
 * Search for a city or a meetup place with Google Places.
 *  - city mode: Pakistani cities only; the choice is checked and its outline returned.
 *  - place mode: results are limited to `bounds` (the chosen city) and anything outside is refused.
 * Without an API key, or if Google fails, it falls back to a text field. A typed city is
 * still checked (against Google, or a built-in list of Pakistani cities).
 */
export default function PlacePicker({
  mode,
  label,
  value,
  onChange,
  onResolve,
  verified,
  bounds,
  cityName,
  error,
  hint,
  placeholder,
}: {
  mode: "city" | "place";
  label: string;
  value: string;
  /** text was typed by hand (city: not verified yet) */
  onChange: (text: string) => void;
  /** a city was verified, or a place was picked from Google */
  onResolve?: (text: string, box: Box | null) => void;
  verified?: boolean;
  /** place mode: only show results inside this outline */
  bounds?: Box | null;
  cityName?: string;
  error?: string;
  /** place mode, typed: progress text that replaces the default hint */
  hint?: string;
  placeholder: string;
}) {
  const { theme } = useTheme();
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(mapsEnabled ? "loading" : "failed");
  const [manual, setManual] = useState(!mapsEnabled);
  const [searching, setSearching] = useState(true);
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState("");
  const latest = useRef(value);
  latest.current = value;
  const cb = useRef({ onChange, onResolve });
  cb.current = { onChange, onResolve };

  const useSearch = mapsEnabled && !manual && status !== "failed";
  const showSearchBox = useSearch && (!value || searching);
  const boundsKey = bounds ? JSON.stringify(bounds) : "";

  /* Google autocomplete */
  useEffect(() => {
    if (!showSearchBox) return;
    let dead = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let el: any;
    loadPlaces()
      .then((lib) => {
        if (dead || !host.current) return;
        el = new lib.PlaceAutocompleteElement({
          includedRegionCodes: ["pk"],
          requestedLanguage: "en",
          ...(mode === "city" ? { includedPrimaryTypes: ["locality"] } : {}),
          ...(mode === "place" && bounds ? { locationRestriction: bounds } : {}),
        });
        el.style.colorScheme = theme;
        el.style.width = "100%";
        // newer builds fire `gmp-select` with a prediction, older ones `gmp-placeselect` with a place
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPick = async (ev: any) => {
          try {
            const place = ev.place ?? ev.placePrediction.toPlace();
            await place.fetchFields({
              fields: mode === "city" ? ["displayName", "addressComponents", "viewport"] : ["displayName", "formattedAddress", "location"],
            });
            const name: string = place.displayName ?? "";
            if (mode === "city") {
              const country = place.addressComponents?.find((c: { types: string[] }) => c.types.includes("country"));
              if (country && country.shortText !== "PK") {
                setProblem(`"${name}" is not in Pakistan. MobileTradeX only works for sellers in Pakistan.`);
                return;
              }
              setProblem("");
              cb.current.onResolve?.(name, place.viewport?.toJSON() ?? null);
            } else {
              const loc = place.location;
              if (bounds && loc && (loc.lat() > bounds.north || loc.lat() < bounds.south || loc.lng() > bounds.east || loc.lng() < bounds.west)) {
                setProblem(`That place is outside ${cityName ?? "your city"}. Search for a place in ${cityName ?? "your city"}.`);
                return;
              }
              const addr: string = place.formattedAddress ?? "";
              setProblem("");
              cb.current.onResolve?.(addr.toLowerCase().includes(name.toLowerCase()) ? addr : `${name}, ${addr}`, null);
            }
            setSearching(false);
          } catch {
            setStatus("failed");
          }
        };
        el.addEventListener("gmp-select", onPick);
        el.addEventListener("gmp-placeselect", onPick);
        host.current.replaceChildren(el);
        setStatus("ready");
      })
      .catch((e) => {
        console.warn("PlacePicker: Google Places unavailable", e);
        if (!dead) setStatus("failed");
      });
    return () => {
      dead = true;
      el?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSearchBox, mode, theme, boundsKey]);

  /* typed city: check it once the seller pauses */
  useEffect(() => {
    if (mode !== "city" || useSearch || !value.trim() || verified) return;
    setChecking(true);
    setProblem("");
    const text = value;
    const id = setTimeout(async () => {
      try {
        const r = await resolveCity(text);
        if (latest.current === text) cb.current.onResolve?.(r.name, r.box);
      } catch (e) {
        if (latest.current === text) setProblem(e instanceof CityError ? e.message : "We could not check that city. Try again.");
      } finally {
        if (latest.current === text) setChecking(false);
      }
    }, 700);
    return () => {
      clearTimeout(id);
      setChecking(false);
    };
  }, [value, verified, mode, useSearch]);

  const shown = problem || error;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>

      {useSearch ? (
        <>
          {value && !searching ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-deep bg-deep/10 px-4 py-3 ring-1 ring-deep">
              <span className="min-w-0 text-[0.95rem] font-medium">{value}{mode === "city" ? ", Pakistan" : ""}</span>
              <button type="button" onClick={() => { setSearching(true); setProblem(""); }} className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-deep hover:bg-ink/10">
                Change
              </button>
            </div>
          ) : (
            <>
              <div ref={host} className={status === "loading" ? "hidden" : ""} aria-label={label} />
              {status === "loading" && <p className="rounded-xl border border-ink/20 px-4 py-3 text-sm text-ink/65">Loading place search…</p>}
              <p className="mt-1.5 text-sm text-ink/65">
                {mode === "city" ? "Only cities in Pakistan are shown." : `Only places in ${cityName ?? "your city"} are shown.`}
              </p>
            </>
          )}
          <button type="button" onClick={() => setManual(true)} className="mt-2 text-sm font-medium text-deep underline-offset-2 hover:underline">
            Can&rsquo;t find it? Type it instead
          </button>
        </>
      ) : (
        <>
          <input
            aria-label={label}
            aria-invalid={!!shown}
            className={inputCls(!!shown)}
            value={value}
            maxLength={120}
            placeholder={placeholder}
            onChange={(e) => {
              setProblem("");
              cb.current.onChange(e.target.value);
            }}
          />
          <p aria-live="polite" className={`mt-1.5 flex items-center gap-1.5 text-sm ${verified && mode === "city" && !shown ? "text-deep" : "text-ink/65"}`}>
            {mode === "city" && checking ? (
              "Checking the city…"
            ) : mode === "city" && verified && !shown ? (
              <><Check size={13} /> {value}, Pakistan</>
            ) : mode === "city" ? (
              mapsEnabled && status === "failed" ? "Place search could not load. Type the city and we will check it." : "Type a city in Pakistan, for example Sialkot."
            ) : (
              hint ?? `Include the area or landmark in ${cityName ?? "your city"}. We cannot check typed places.`
            )}
          </p>
          {mapsEnabled && status !== "failed" && (
            <button type="button" onClick={() => { setManual(false); setSearching(true); }} className="mt-1 text-sm font-medium text-deep underline-offset-2 hover:underline">
              Search with Google instead
            </button>
          )}
        </>
      )}

      {shown && (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-crack" role="alert">
          <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9.5" />
            <path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
          {shown}
        </p>
      )}
    </div>
  );
}
