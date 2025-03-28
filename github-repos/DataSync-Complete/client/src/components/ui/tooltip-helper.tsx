import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedContainer } from "./animated-container";

interface TooltipHelperProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

export function TooltipHelper({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 300,
}: TooltipHelperProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          <AnimatedContainer animation="fade-in" duration={200}>
            {content}
          </AnimatedContainer>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}