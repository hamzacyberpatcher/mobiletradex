"use client";

import { bodyOptions, issueOptions, panelOptions, screenOptions } from "@/data/listing";
import { gradeOf } from "@/lib/listing";
import { Callout, ChipGroup, Field, inputCls } from "./ui";
import type { StepProps } from "./types";

export default function ConditionStep({ draft, set, errors }: StepProps) {
  const grade = gradeOf(draft);
  const toggle = (v: string) => set({ issues: draft.issues.includes(v) ? draft.issues.filter((x) => x !== v) : [...draft.issues, v] });

  return (
    <div className="space-y-8">
      <ChipGroup legend="Screen" options={screenOptions} value={draft.screen} onChange={(v) => set({ screen: v })} error={errors.screen} />
      <ChipGroup legend="Frame and back" options={bodyOptions} value={draft.body} onChange={(v) => set({ body: v })} error={errors.body} />
      <ChipGroup legend="Repairs" options={panelOptions} value={draft.panel} onChange={(v) => set({ panel: v })} error={errors.panel} columns="sm:grid-cols-2" />

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="battery" className="text-sm font-medium">Battery health</label>
          <output htmlFor="battery" className="text-lg font-semibold tabular-nums">{draft.battery}%</output>
        </div>
        <input
          id="battery"
          type="range"
          min={50}
          max={100}
          step={1}
          value={draft.battery}
          onChange={(e) => set({ battery: Number(e.target.value) })}
          aria-valuetext={`${draft.battery} percent`}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-deep"
        />
        <div className="mt-1 flex justify-between text-xs text-ink/60"><span>50%</span><span>100%</span></div>
        <p className="mt-1.5 text-sm text-ink/65">iPhone: Settings, Battery, Battery Health. Android: Settings, About phone, Battery.</p>
      </div>

      <ChipGroup
        legend="Anything that does not work properly?"
        multiple
        options={issueOptions.map((i) => ({ value: i.value, label: i.label }))}
        value={draft.issues}
        onChange={toggle}
        columns="sm:grid-cols-3"
        hint="Leave empty if everything works. The hardware test will confirm it."
      />

      <Field label="Anything else buyers should know?" optional hint={`${draft.note.length} / 200`}>
        {(p) => (
          <textarea {...p} rows={3} maxLength={200} className={inputCls()} value={draft.note} placeholder="Repaired once at Hafeez Centre in 2023, screen replaced with an original panel." onChange={(e) => set({ note: e.target.value })} />
        )}
      </Field>

      {grade && (
        <Callout kind={grade === "Needs repair" || grade === "Fair" ? "warn" : "success"} title={`Your phone will be listed as "${grade}"`}>
          We work this out from what you described, so every listing is graded the same way. Buyers see the defects before the price.
        </Callout>
      )}
    </div>
  );
}
