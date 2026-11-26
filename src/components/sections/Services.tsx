"use client";

import Story from "./Story";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack";
import { services } from "@/data/content";
import {
  PricingDemo,
  VerifyDemo,
  EscrowDemo,
  MeetupDemo,
  ChatDemo,
  ReviewDemo,
} from "./ServiceDemos";

// same order as `services` in data/content.ts
const demos = [PricingDemo, VerifyDemo, EscrowDemo, MeetupDemo, ChatDemo, ReviewDemo];

export default function Services() {
  return (
    <Story index={3} id="services">
      <h2 className="h-section">Built for both sides of the deal.</h2>
      <p className="mt-4 max-w-[42rem] text-lg leading-relaxed text-ink/75">
        Try each one. They work the way they will in the app.
      </p>

      <div className="mt-6">
        <ScrollStack
          useWindowScroll
          smoothScroll={false}
          snap={false}
          stackPosition="16%"
          itemDistance={28}
          itemStackDistance={16}
          baseScale={0.9}
          itemScale={0.025}
          dimAmount={0.08}
          holdDistance={120}
        >
          {services.map((s, i) => {
            const Demo = demos[i];
            return (
              <ScrollStackItem
                key={s.title}
                itemClassName="!h-[19.5rem] !rounded-2xl !p-6 border border-ink/10"
                style={{ background: "rgb(var(--c-frost-50))", color: "rgb(var(--c-ink))", boxShadow: "0 12px 32px rgb(0 0 0 / 0.14)" }}
              >
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                    <span className="font-mono text-xs text-deep">{s.detail}</span>
                  </div>
                  <p className="mt-2 max-w-[42rem] text-[0.95rem] leading-relaxed text-ink/75">{s.body}</p>
                  <div className="mt-auto border-t border-ink/10 pt-4">
                    <Demo />
                  </div>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>
    </Story>
  );
}
