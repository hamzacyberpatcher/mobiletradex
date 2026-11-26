"use client";

import { useId } from "react";
import { photoSlots } from "@/data/listing";
import { REQUIRED_PHOTOS, type Photos } from "@/lib/listing";
import { useToast } from "@/components/ToastProvider";
import { Callout, Check } from "./ui";
import type { StepProps } from "./types";

const MAX_MB = 5;

export default function PhotosStep({
  errors,
  photos,
  setPhoto,
}: StepProps & { photos: Photos; setPhoto: (id: string, p: Photos[string] | null) => void }) {
  const { toast } = useToast();
  const uid = useId();
  const have = REQUIRED_PHOTOS.filter((id) => photos[id]).length;

  const pick = (id: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("That file is not a photo. Choose a JPG or PNG image.", { kind: "error" });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`That photo is ${(file.size / 1048576).toFixed(1)} MB. Photos can be up to ${MAX_MB} MB.`, { kind: "error" });
      return;
    }
    setPhoto(id, { url: URL.createObjectURL(file), name: file.name });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-medium">{have} of {REQUIRED_PHOTOS.length} required photos added</p>
        <p className="text-ink/65">JPG or PNG, up to {MAX_MB} MB each</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-invalid={!!errors.photos}>
        {photoSlots.map((s) => {
          const p = photos[s.id];
          const inputId = `${uid}-${s.id}`;
          return (
            <li key={s.id} className="relative">
              <input id={inputId} type="file" accept="image/*" className="peer sr-only" onChange={(e) => { pick(s.id, e.target.files?.[0]); e.target.value = ""; }} />
              <label
                htmlFor={inputId}
                className={`relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border text-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-deep ${
                  p ? "border-deep" : errors.photos && s.required ? "border-dashed border-crack/60 hover:bg-ink/5" : "border-dashed border-ink/30 hover:border-ink/50 hover:bg-ink/5"
                }`}
              >
                {p ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`${s.label}: ${p.name}`} className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-deep text-snow dark:text-night"><Check size={11} /></span>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60" aria-hidden>
                      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.6h6.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
                      <circle cx="12" cy="12.5" r="3.3" />
                    </svg>
                    <span className="mt-2 px-2 text-sm font-medium">{s.label}</span>
                    <span className="text-xs text-ink/60">{s.required ? "Required" : "Optional"}</span>
                  </>
                )}
              </label>
              {p && (
                <button
                  type="button"
                  aria-label={`Remove ${s.label} photo`}
                  onClick={() => {
                    setPhoto(s.id, null);
                    toast(`Removed the ${s.label.toLowerCase()} photo.`, { action: { label: "Undo", onClick: () => setPhoto(s.id, p) }, duration: 5000 });
                  }}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-night/70 text-snow backdrop-blur hover:bg-night"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {errors.photos && <p role="alert" className="text-sm text-crack">{errors.photos}</p>}
      <Callout title="Photograph any damage up close">
        If the phone has a crack, dent or a replaced panel, include a clear photo of it in the sides and corners slot. Buyers trust listings that show flaws.
      </Callout>
      <p className="text-xs text-ink/55">Photos stay on this device in the prototype and are not saved with your draft.</p>
    </div>
  );
}
