import Story from "./Story";
import Stepper, { Step } from "@/components/ThemedStepper";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 py-1.5 text-[0.95rem]">
      <dt className="text-ink/60">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function Solution() {
  return (
    <Story index={2} id="how">
      <h2 className="h-section">Condition comes first, in the same order every time.</h2>
      <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink/80">
        Every listing follows one format: the phone, its specs, its condition,
        then the price. Damage isn&rsquo;t hidden. It&rsquo;s listed up front and
        reflected in the price. Repair the phone and run the test again, and
        the report updates.
      </p>

      <div className="mt-7 max-w-[34rem]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-semibold">Listing report</span>
          <span className="rounded-full bg-deep px-3 py-1 text-xs font-medium text-frost-50">
            Verified Hardware
          </span>
        </div>
        <Stepper
          width="100%"
          radius={14}
          nextButtonText="Next"
          backButtonText="Back"
          completeButtonText="Finish"
          completedContent={
            <div className="py-2">
              <p className="font-semibold">That&rsquo;s the whole listing.</p>
              <p className="mt-1 text-[0.95rem] text-ink/70">
                Same four steps on every phone, so you always know where to look.
              </p>
            </div>
          }
        >
          <Step title="Phone">
            <dl>
              <Field label="Model">Galaxy S21</Field>
              <Field label="Storage">128 GB, 8 GB RAM</Field>
            </dl>
          </Step>
          <Step title="Specs">
            <dl>
              <Field label="Display">6.2 inch, 120 Hz</Field>
              <Field label="Network">PTA approved</Field>
              <Field label="Battery">87% health</Field>
            </dl>
          </Step>
          <Step title="Condition">
            <dl>
              <Field label="Screen">Hairline crack, lower right. Shown in photos.</Field>
              <Field label="Body">Light scuffs on the back. Shown in photos.</Field>
            </dl>
          </Step>
          <Step title="Price">
            <dl>
              <Field label="Asking">PKR 61,500</Field>
              <Field label="Fair value">PKR 59,000 to 64,000</Field>
            </dl>
          </Step>
        </Stepper>
        <p className="mt-3 font-mono text-xs text-ink/65">
          IMEI 35 4821 09 718264 3 · valid, not reported stolen
        </p>
      </div>
    </Story>
  );
}
