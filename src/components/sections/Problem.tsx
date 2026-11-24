import Story from "./Story";
import GlitchText from "@/components/reactbits/GlitchText";
import FuzzyText from "@/components/reactbits/FuzzyText";

export default function Problem() {
  return (
    <Story index={1} id="problem">
      <h2 className="h-section">
        The{" "}
        <GlitchText
          trigger="hover"
          fontSize="inherit"
          fontWeight="inherit"
          shadowColors={["#C2523A", "#7FA2BF"]}
          className="!mx-0 !inline-block !cursor-default"
        >
          flaw
        </GlitchText>{" "}
        is always in the last line.
      </h2>
      <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink/80">
        On classifieds, sellers can bury dents, panel changes and screen lines
        at the bottom of a long description. Most buyers don&rsquo;t read that
        far. They find out at the meetup.
      </p>

      <figure className="mt-7 max-w-[34rem] rounded-xl border border-ink/15 bg-frost-50/80 p-5 font-mono text-[0.85rem] leading-relaxed">
        <figcaption className="mb-3 font-sans text-sm text-ink/60">
          A typical listing, as written
        </figcaption>
        <p className="text-ink">Galaxy S21, 128 GB. PTA approved. 10/10 condition.</p>
        <p className="text-ink/80">Battery health 87%. Box and charger included. Serious buyers only, no bargaining.</p>
        <p className="mt-1.5 text-ink/60">
          <span className="relative inline-block border-b-2 border-crack pb-0.5">
            {/* invisible copy sets the width; the canvas has fuzz padding, so it is pulled back by it */}
            <span aria-hidden className="invisible">
              screen has a small line, back panel was changed
            </span>
            <span className="absolute -left-9 top-[3px]">
              <FuzzyText
                fontSize="0.85rem"
                fontWeight={400}
                baseIntensity={0.3}
                hoverIntensity={0}
                fuzzRange={12}
              >
                screen has a small line, back panel was changed
              </FuzzyText>
            </span>
          </span>
        </p>
      </figure>

      <dl className="mt-7 grid max-w-[34rem] gap-3 text-[0.95rem]">
        <div className="flex gap-3">
          <dt className="w-32 shrink-0 font-semibold">Buyers told us</dt>
          <dd className="text-ink/80">
            Condition is vague, sellers have no reviews, and inspection claims
            can&rsquo;t be checked.
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-32 shrink-0 font-semibold">Sellers told us</dt>
          <dd className="text-ink/80">
            Anyone can post without ID, so honest sellers get lumped in with
            scammers.
          </dd>
        </div>
      </dl>
    </Story>
  );
}
