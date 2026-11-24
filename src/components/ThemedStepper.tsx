"use client";

import type { ComponentProps } from "react";
import Stepper from "./reactbits/Stepper";
import { useTheme } from "./ThemeProvider";

export { Step } from "./reactbits/Stepper";

/** React Bits Stepper with its light/dark theme and accent following the site theme. */
export default function ThemedStepper(props: ComponentProps<typeof Stepper>) {
  const { theme } = useTheme();
  return <Stepper {...props} theme={theme} accentColor={theme === "dark" ? "#6FA4D6" : "#2E5E8E"} />;
}
