"use client";

import React from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  currentStep: number;
  className?: string;
}

const steps = [
  { id: 1, label: "Model Prompt", route: "/model-prompt" },
  { id: 2, label: "Dataset Upload", route: "/dataset-upload" },
  { id: 3, label: "Training", route: "/model-training" },
  { id: 4, label: "Deployment", route: "/playground" },
];

export default function ProgressStepper({ currentStep, className }: ProgressStepperProps) {
  const router = useRouter();

  const handleStepClick = (stepId: number, route: string) => {
    // Only allow navigation for completed steps
    if (stepId < currentStep) {
      router.push(route);
    }
  };

  return (
    <nav
      className={cn(
        "w-full bg-black/50 backdrop-blur-sm py-4 select-none",
        className
      )}
      aria-label="Progress"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLastStep = index === steps.length - 1;
          const lineCompleted = isCompleted;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center relative">
                {/* Step Content */}
                <div
                  onClick={() => handleStepClick(step.id, step.route)}
                  className={cn(
                    "flex items-center gap-3 group relative z-10 transition-all duration-300",
                    isCompleted && "cursor-pointer hover:opacity-80"
                  )}
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300",
                      isCompleted
                        ? "border-neutral-800 bg-neutral-900/50 text-neutral-500 group-hover:border-neutral-700 group-hover:bg-neutral-800/50"
                        : isActive
                        ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]"
                        : "border-neutral-800 bg-transparent text-neutral-700 group-hover:border-neutral-700"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{step.id}</span>
                    )}
                    
                    {/* Active Glow Effect (optional, subtle pulse) */}
                    {isActive && (
                       <span className="absolute inset-0 rounded-full ring-1 ring-blue-500/50 animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                      isCompleted
                        ? "text-neutral-500 group-hover:text-neutral-400"
                        : isActive
                        ? "text-white drop-shadow-sm"
                        : "text-neutral-600 group-hover:text-neutral-500"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
              
              {/* Connecting Line */}
              {!isLastStep && (
                <div className="relative mx-2 md:mx-4 flex items-center">
                  <div
                    className={cn(
                      "h-0.5 w-12 md:w-20 lg:w-24 transition-colors duration-300",
                      lineCompleted
                        ? "bg-blue-500"
                        : "bg-neutral-800"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}