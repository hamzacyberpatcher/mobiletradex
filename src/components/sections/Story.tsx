import type { ReactNode } from "react";

/**
 * Sections that sit on top of the fixed 3D phone. The text column keeps to
 * the left on desktop so the handset has the right half to itself; on phones
 * the text drops to the bottom and the handset floats above it.
 */
export default function Story({
  index,
  id,
  children,
}: {
  index: number;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-story={index}
      className="relative z-10 flex min-h-[100svh] items-end px-5 pb-10 pt-28 md:px-8 lg:items-center lg:pb-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="story-panel lg:max-w-[46%]">
          {children}
        </div>
      </div>
    </section>
  );
}
