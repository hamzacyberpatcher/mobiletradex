"use client";

import { useState } from "react";
import { accessoryOptions, ageOptions, colors, genericRam, genericStorage, phoneBrands, ptaOptions } from "@/data/listing";
import { brandOf, check, digits, modelOf } from "@/lib/listing";
import { ChipGroup, Check, Field, inputCls } from "./ui";
import type { StepProps } from "./types";

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function DeviceStep({ draft, set, errors, hints }: StepProps) {
  const [query, setQuery] = useState("");
  const brand = brandOf(draft);
  const model = modelOf(draft);
  const models = (brand?.models ?? []).filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  const custom = draft.customModel;
  const imeiOk = check.imei(draft.imei).ok;

  return (
    <div className="space-y-8">
      {/* brand */}
      <fieldset aria-invalid={!!errors.brand}>
        <legend className="mb-1.5 text-sm font-medium">Brand</legend>
        <div role="radiogroup" aria-label="Brand" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {phoneBrands.map((b) => {
            const on = draft.brand === b.slug;
            return (
              <button
                key={b.slug}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={b.name}
                onClick={() => {
                  if (!on) set({ brand: b.slug, model: "", customModel: false, storage: "", ram: "" });
                  setQuery("");
                }}
                className={`relative overflow-hidden rounded-xl border bg-snow transition-all ${on ? "border-deep ring-2 ring-deep" : errors.brand ? "border-crack/50 hover:border-ink/50" : "border-ink/15 hover:border-ink/45"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/brands/${b.slug}.svg`} alt="" className="aspect-[13/10] w-full object-cover" />
                {on && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-deep text-snow dark:text-night">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.brand && <p className="mt-1.5 text-sm text-crack">{errors.brand}</p>}
      </fieldset>

      {/* model */}
      {brand && (
        <fieldset aria-invalid={!!errors.model} className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">{brand.name} model</legend>
          {brand.models.length > 4 && (
            <input
              type="search"
              aria-label={`Search ${brand.name} models`}
              placeholder={`Search ${brand.name} models`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={inputCls()}
            />
          )}
          <div role="radiogroup" aria-label="Model" className="grid gap-2 sm:grid-cols-2">
            {models.map((m) => {
              const on = draft.model === m.name && !custom;
              return (
                <button
                  key={m.name}
                  type="button"
                  role="radio"
                  aria-checked={on && !custom}
                  onClick={() => set({ model: m.name, customModel: false, storage: m.storage.length === 1 ? m.storage[0] : "", ram: m.ram.length === 1 ? m.ram[0] : "" })}
                  className={`rounded-xl border px-3.5 py-3 text-left text-[0.95rem] font-medium transition-colors ${on ? "border-deep bg-deep/10 ring-1 ring-deep" : errors.model ? "border-crack/50" : "border-ink/20 hover:border-ink/45 hover:bg-ink/5"}`}
                >
                  {brand.name} {m.name}
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={custom}
              onClick={() => set({ customModel: true, model: query.trim(), storage: "", ram: "" })}
              className={`rounded-xl border border-dashed px-3.5 py-3 text-left text-[0.95rem] font-medium transition-colors sm:col-span-2 ${custom ? "border-deep bg-deep/10 ring-1 ring-deep" : errors.model ? "border-crack/50" : "border-ink/30 hover:border-ink/50 hover:bg-ink/5"}`}
            >
              My model isn&rsquo;t listed
              <span className="block text-xs font-normal text-ink/65">{query.trim() && !models.length ? `Enter "${query.trim()}" yourself` : "Type the model name yourself"}</span>
            </button>
          </div>
          {custom && (
            <div className="pt-2">
              <Field label="Model name" hint={hints.model ?? "Exactly as shown in Settings, About phone. We will not have a price suggestion for it, so you set the price."} error={errors.model}>
                {(p) => <input {...p} className={inputCls(!!errors.model)} autoFocus value={draft.model} maxLength={40} placeholder={`${brand.name} model name`} onChange={(e) => set({ model: e.target.value })} />}
              </Field>
            </div>
          )}
          {!custom && errors.model && <p className="text-sm text-crack">{errors.model}</p>}
        </fieldset>
      )}

      {/* specs */}
      {(model || custom) && (
        <div className="space-y-6">
          <ChipGroup legend="Storage" options={(custom ? genericStorage : model!.storage).map((s) => ({ value: s, label: s }))} value={draft.storage} onChange={(v) => set({ storage: v })} error={errors.storage} columns="sm:grid-cols-4" />
          <ChipGroup legend="RAM" options={(custom ? genericRam : model!.ram).map((s) => ({ value: s, label: s }))} value={draft.ram} onChange={(v) => set({ ram: v })} error={errors.ram} columns="sm:grid-cols-4" />
        </div>
      )}
      <ChipGroup legend="Colour" options={colors.map((c) => ({ value: c, label: c }))} value={draft.color} onChange={(v) => set({ color: v })} error={errors.color} columns="sm:grid-cols-5" />
      <ChipGroup legend="PTA status" options={ptaOptions} value={draft.pta} onChange={(v) => set({ pta: v })} error={errors.pta} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="IMEI number"
          hint={imeiOk ? undefined : (hints.imei ?? "Dial *#06# on the phone to see it. Buyers can check it against PTA.")}
          error={errors.imei}
        >
          {(p) => (
            <>
              <input
                {...p}
                className={`${inputCls(!!errors.imei)} font-mono tracking-wide`}
                inputMode="numeric"
                maxLength={15}
                value={draft.imei}
                placeholder="356938035643809"
                onChange={(e) => set({ imei: digits(e.target.value).slice(0, 15) })}
              />
              {imeiOk && !errors.imei && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-deep">
                  <Check size={13} /> IMEI format is valid
                </p>
              )}
            </>
          )}
        </Field>
        <Field label="Model number or variant" optional hint="For example A2633 or 5G.">
          {(p) => <input {...p} className={inputCls()} value={draft.variant} placeholder="A2633, 5G" maxLength={30} onChange={(e) => set({ variant: e.target.value })} />}
        </Field>
      </div>

      <ChipGroup legend="How long have you used it?" options={ageOptions} value={draft.age} onChange={(v) => set({ age: v })} error={errors.age} columns="sm:grid-cols-3" />
      <ChipGroup legend="What comes with it?" multiple options={accessoryOptions} value={draft.accessories} onChange={(v) => set({ accessories: toggle(draft.accessories, v) })} columns="sm:grid-cols-4" hint="The original box and charger raise the suggested price." />
    </div>
  );
}
