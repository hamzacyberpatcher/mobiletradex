/** Rules shared by the full /chat page and the floating chat window. */

export const TEMPLATES = [
  "Is it still available?",
  "Can you share the hardware report?",
  "Can we meet at a safe zone?",
  "Is the price negotiable?",
];

export const PHONE_RE = /(\+?92[\s-]?|0)3\d{2}[\s-]?\d{7}/g;
export const PHONE_TEST = new RegExp(PHONE_RE.source); // no /g flag, so .test() keeps no state
export const SCAM_RE = /(advance|easypaisa|jazzcash|western union|bank transfer|whatsapp)/i;

export const REPLIES: [RegExp, string][] = [
  [/available/i, "Yes, it is still available. You are welcome to inspect it at a safe zone."],
  [/report|test/i, "The full hardware report is on the listing page. Every test passed except what is written under condition."],
  [/meet|zone|mall/i, "Sure. I can do weekday evenings or Saturday afternoon at the safe zone listed in my ad."],
  [/price|negotiable|lower|discount/i, "A little room is there. Send me an offer with the Make offer button and I will answer today."],
];

export const time = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

export const cannedReply = (said: string, sellerFirst: string) =>
  REPLIES.find(([re]) => re.test(said))?.[1] ?? `Thanks for your message. ${sellerFirst} will get back to you shortly.`;
