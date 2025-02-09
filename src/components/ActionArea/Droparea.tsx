"use client";

import React, { useState } from "react";
import FileDropzone from "./FileDropZone";
import ChainOfThoughtProgress from "./ChainOfThoughtProgress";
import CreditList from "./CreditList";
import { CreditItem } from "@/utils/types";

const jsonData: CreditItem[] = [
  {
    accountNumber: "ACC-1001",
    creditLevel: "approved",
    description: [
      "Stable income source",
      "Good credit history",
      "Low debt-to-income ratio",
    ],
  },
  {
    accountNumber: "ACC-1002",
    creditLevel: "declined",
    description: [
      "Multiple late payments",
      "High credit utilization",
      "Low credit score",
    ],
  },
  {
    accountNumber: "ACC-1003",
    creditLevel: "underReview",
    riskLevel: "low",
    description: [
      "Recent job change",
      "Limited credit history",
      "Moderate debt-to-income ratio",
    ],
  },
  {
    accountNumber: "ACC-1004",
    creditLevel: "underReview",
    riskLevel: "high",
    description: [
      "Significant outstanding loans",
      "Multiple recent credit inquiries",
      "Unstable income",
    ],
  },
  {
    accountNumber: "ACC-1005",
    creditLevel: "declined",
    description: [
      "Bankruptcy history",
      "Missed loan payments",
      "High default risk",
    ],
  },
  {
    accountNumber: "ACC-1006",
    creditLevel: "approved",
    description: [
      "Excellent payment history",
      "Diverse credit mix",
      "Consistently high credit score",
    ],
  },
];

const Droparea = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [chainOfThought, setChainOfThought] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  /**
   * Simulates the chain-of-thought:
   * 1. Animate steps (every 2 seconds)
   * 2. In parallel, upload files to /upload
   * 3. Once both are complete, show the data.
   */
  const simulateChainOfThought = async () => {
    if (files.length === 0) return;

    // Reset UI states
    setIsLoading(true);
    setJsonData(null);

    const steps = [
      "Analyzing file contents...",
      "Extracting relevant information...",
      "Applying natural language processing...",
      "Identifying key entities and relationships...",
      "Generating insights...",
      "Summarizing findings...",
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
          setJsonData(serverResult);
          setIsLoading(false);
        }
      }
    }, stepDelay);

    console.log("starting API call");

    try {
      const formData = new FormData();
      
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/upload", {
        // Updated URL
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();

      console.log(data);
      serverResult = data;
      serverDone = true;

      if (stepIndex < totalSteps) {
        setCurrentStep(totalSteps); // jump to final step
        clearInterval(intervalId);
        setJsonData(serverResult);
        setIsLoading(false);
      } else {
        setJsonData(serverResult);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      serverDone = true;
      setIsLoading(false);
      clearInterval(intervalId);
      // Optionally display an error message here.
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <FileDropzone
        files={files}
        previews={previews}
        onFilesChange={setFiles}
        onPreviewsChange={setPreviews}
        onRemoveFile={handleRemoveFile}
      />

      <div>
        <button
          onClick={simulateChainOfThought}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center mt-7 cursor-pointer"
          disabled={isLoading || files.length === 0}
        >
          {isLoading ? "Processing..." : "Next Step"}
        </button>
      </div>

      {chainOfThought.length > 0 && (
        <ChainOfThoughtProgress
          chainOfThought={chainOfThought}
          currentStep={currentStep}
        />
      )}

      {jsonData && <CreditList finalJson={jsonData} currenState={isLoading} />}
    </div>
  );
};

export default Droparea;
