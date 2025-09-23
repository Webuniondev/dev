"use client";

import { Check } from "lucide-react";
import * as React from "react";

type Step = {
  id: string;
  title: string;
  description?: string;
};

export type StepperProps = {
  steps: Step[];
  current: number; // 1-based index of active step
  className?: string;
};

export function Stepper({ steps, current, className }: StepperProps) {
  const total = steps.length;
  return (
    <div
      className={`rounded-xl border border-white/15 bg-white/5 p-4 sm:p-6 ${className ?? ""}`}
      role="group"
      aria-label="Progression d'inscription"
    >
      <ol className="flex items-center gap-3 sm:gap-5" role="list">
        {steps.map((step, idx) => {
          const index = idx + 1;
          const isActive = index === current;
          const isCompleted = index < current;
          return (
            <React.Fragment key={step.id}>
              <li className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`grid size-8 sm:size-9 place-items-center rounded-full border text-xs font-semibold transition-colors
                      ${isCompleted ? "bg-green-500 text-black border-green-500" : ""}
                      ${isActive && !isCompleted ? "bg-white text-black border-white" : ""}
                      ${!isActive && !isCompleted ? "bg-white text-black/80 border-white/80" : ""}
                    `}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`${step.title}`}
                  >
                    {isCompleted ? <Check className="size-4" /> : index}
                  </div>
                  <div className="mt-2 hidden text-center sm:block">
                    <div className={`text-xs font-medium ${isActive ? "text-white" : "text-white/70"}`}>
                      {step.title}
                    </div>
                    {step.description ? (
                      <div className="text-[11px] text-white/50">{step.description}</div>
                    ) : null}
                  </div>
                </div>
              </li>
              {index < total ? (
                <li aria-hidden className="flex-1">
                  <div className="h-px w-full bg-white/15" />
                </li>
              ) : null}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
}


