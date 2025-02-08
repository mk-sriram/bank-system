import React from "react";

interface ChainOfThoughtProgressProps {
  chainOfThought: string[];
  currentStep: number;
}

/**
 * Renders all steps at once.
 * - If `index < currentStep`, the step is completed (orange + line-through).
 * - If `index === currentStep`, it's active (gray + pulsing).
 * - Otherwise, it's a future step in plain gray.
 */
const ChainOfThoughtProgress: React.FC<ChainOfThoughtProgressProps> = ({
  chainOfThought,
  currentStep,
}) => {
  return (
    <div className="relative flex flex-col space-y-6 p-4 w-full max-w-md pt-10">
      {/* We won't hide anything; all steps are always visible. */}
      <div className="relative">
        {chainOfThought.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLastStep = index === chainOfThought.length - 1;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center mb-6 last:mb-0"
            >
              {/* Vertical connecting line (through the center) */}
              {!isLastStep && (
                <div
                  className={`
                    absolute h-full w-0.5 
                    ${isCompleted ? "bg-orange-500" : "bg-gray-300"}
                  `}
                  style={{ top: "1.5rem" }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <p
                  className={`
                    font-medium text-center px-2
                    ${
                      isCompleted
                        ? // Completed steps: orange + line-through
                          "text-orange-500"
                        : isActive
                        ? // Active step: gray + pulsing
                          "text-gray-400 animate-pulse"
                        : // Future steps: plain gray
                          "text-gray-400"
                    }
                  `}
                >
                  {step}
                  {/* Show a checkmark if the step is completed (and not the active one) */}
                  {isCompleted && !isActive && (
                    <span className="ml-2 text-orange-500 font-semibold">
                      ✓
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChainOfThoughtProgress;
