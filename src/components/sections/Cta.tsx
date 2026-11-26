"use client";

import Silk from "@/components/reactbits/Silk";
import SlideCommit from "@/components/reactbits/SlideCommit";

export default function Cta() {
  return (
    <section id="cta" className="relative z-10 overflow-hidden bg-brand text-snow">
      <div className="absolute inset-0" aria-hidden>
        <Silk color="#2E5E8E" sheenColor="#B7C9D8" noiseIntensity={1.1} paused intro={false} mouseInteraction={false} clickRipple={false} />
      </div>
      <div className="relative px-5 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <h2 className="h-display max-w-4xl text-[clamp(2.4rem,5.2vw,4.6rem)]">
            Sell the phone in your drawer. Or buy one you can trust.
          </h2>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-snow">
            Listing takes a few minutes: confirm your CNIC, run the hardware test,
            and get a fair price suggestion.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <SlideCommit
              label="Slide to start selling"
              doneLabel="Listing started"
              width={330}
              height={58}
              trackColor="#F3F6F4"
              handleColor="#2E5E8E"
              successColor="#C5C49B"
              onConfirm={() => new Promise((resolve) => setTimeout(resolve, 700))}
            />
            <a href="#brands" className="btn border border-snow/50 text-snow hover:bg-snow/10">
              Browse verified phones
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
