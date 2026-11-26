import type { Draft, Errors } from "@/lib/listing";

/** Props every step receives. `errors` is empty until the seller presses Continue. */
export type StepProps = {
  draft: Draft;
  set: (patch: Partial<Draft>) => void;
  errors: Errors;
  /** grey progress text for unfinished text boxes, e.g. "5 of 13 digits" */
  hints: Errors;
};
