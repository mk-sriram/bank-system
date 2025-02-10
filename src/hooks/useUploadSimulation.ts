// hooks/useUploadSimulation.ts
import { useState, useCallback } from "react";
import { CreditItem } from "@/utils/types";

export default function useUploadSimulation() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<CreditItem[]>([]);
  const [chainOfThought, setChainOfThought] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const simulateChainOfThought = useCallback(async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    // Reset previously stored results.
    setJsonData([]);

    const steps = [
      "Scanning and analyzing file contents",
      "Extraction Agent",
      "Structuring extracted data for processing",
      "Recognizing relationships and connections",
      "Insight Agent synthesizing: Identifying key entities",
      "Correlating extracted insights with contextual knowledge",
      "Generating insights",
    ];

    setChainOfThought(steps);
    setCurrentStep(0);

    let serverResult: any = null;
    let serverDone = false;
    const totalSteps = steps.length;
    let stepIndex = 0;
    const stepDelay = 2000; // 2 seconds per step

    const intervalId = setInterval(() => {
      stepIndex++;
      if (stepIndex <= totalSteps) {
        setCurrentStep(stepIndex);
      }
      if (stepIndex >= totalSteps || serverDone) {
        clearInterval(intervalId);
        if (serverDone && serverResult) {
          setJsonData((prev) => [...prev, ...serverResult]);
          setIsLoading(false);
        }
      }
    }, stepDelay);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      // Assume the API returns an object with a property "text"
      serverResult = data.text;
      serverDone = true;
      console.log(serverResult);
      if (!Array.isArray(serverResult)) {
        serverResult = [serverResult];
      }

      // If the chain-of-thought simulation hasn't finished, jump to the final step.
      if (stepIndex < totalSteps) {
        setCurrentStep(totalSteps);
        clearInterval(intervalId);
        setJsonData((prev) => [...prev, ...serverResult]);
        setIsLoading(false);
      } else {
        setJsonData((prev) => [...prev, ...serverResult]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      serverDone = true;
      setIsLoading(false);
      clearInterval(intervalId);
    }
  }, [files]);

  return {
    files,
    setFiles,
    previews,
    setPreviews,
    isLoading,
    jsonData,
    chainOfThought,
    currentStep,
    simulateChainOfThought,
  };
}
