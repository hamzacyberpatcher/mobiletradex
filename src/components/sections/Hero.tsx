import Story from "./Story";
import DecryptedText from "@/components/reactbits/DecryptedText";

export default function Hero() {
  return (
    <Story index={0} id="top">
      <h1 className="h-display text-[clamp(2.7rem,6.4vw,5.6rem)]">
        <DecryptedText
          text="Know the phone before you meet the seller."
          animateOn="view"
          sequential
          revealDirection="start"
          speed={32}
          maxIterations={10}
          encryptedClassName="text-steel"
        />
      </h1>
      <p className="mt-6 max-w-[42rem] text-lg leading-relaxed text-ink/80 md:text-xl">
        MobileTradeX tests the hardware of every second-hand phone, checks its
        IMEI and the seller&rsquo;s CNIC, and holds your payment until you&rsquo;ve
        inspected it in person.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#brands" className="btn btn-primary">
          Browse verified phones
        </a>
        <a href="#cta" className="btn btn-quiet">
          List your phone
        </a>
      </div>
    </Story>
  );
}
