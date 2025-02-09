"use client";

import type React from "react";
import { useState } from "react";
import ChainOfThoughtProgress from "./ChainOfThoughtProgress";
import CreditList from "./CreditList";
import type { CreditItem } from "@/utils/types";

const finalJson: CreditItem[] = [
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

  // The entire chain of steps, shown at once
  const [chainOfThought, setChainOfThought] = useState<string[]>([]);
  // currentStep indicates which step is active
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    const newPreviews = droppedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const triggerFileInput = () => {
    document.getElementById("dropzone-file")?.click();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    }
    setFiles((prevFiles) => [...prevFiles, ...pastedFiles]);
    const newPreviews = pastedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  /**
   * Simulates chain-of-thought with a parallel server request:
   * 1) Upload files to /upload
   * 2) Animate chain-of-thought steps every 2s
   *    - If server finishes early, skip ahead to final step
   *    - If we reach final step but server isn't done, hold at final
   * 3) When both are complete, show the data
   */
  const simulateChainOfThought = async () => {
    // Just in case, avoid doing anything if no files:
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
    let serverDone = false; // We'll flip to true when the server responds

    // 1) Start the chain-of-thought progression:
    const totalSteps = steps.length;
    let stepIndex = 0;
    const stepDelay = 2000; // 2 seconds per step

    // We'll store the interval ID so we can clear it if needed
    const intervalId = setInterval(() => {
      stepIndex++;
      // If we haven't reached the final step, move forward
      if (stepIndex <= totalSteps) {
        setCurrentStep(stepIndex);
      }
      // If we've reached or passed the final step OR server is done, stop
      if (stepIndex >= totalSteps || serverDone) {
        clearInterval(intervalId);
        // If the server is done and we have data, show final
        if (serverDone && serverResult) {
          setJsonData(serverResult);
          setIsLoading(false);
        }
      }
    }, stepDelay);

    // 2) Meanwhile, start uploading the files:
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      serverResult = data;
      serverDone = true;

      // If chain-of-thought steps haven't reached final step, skip to final step
      if (stepIndex < totalSteps) {
        setCurrentStep(totalSteps); // jump to the last step
        clearInterval(intervalId);
        // Now display the data
        setJsonData(serverResult);
        setIsLoading(false);
      } else {
        // If steps are already at or beyond final step, just show data
        setJsonData(serverResult);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      serverDone = true;
      setIsLoading(false);
      clearInterval(intervalId);
      // You might want to show an error message or do something else
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        id="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
        onPaste={handlePaste}
        className="flex flex-col items-center justify-center w-[80%] md:w-[50%]
                   border-2 border-gray-200 border-dashed rounded-lg cursor-pointer
                   bg-transparent hover:bg-[#fafafa]
                   p-4 h-auto max-h-[50vh] min-h-[200px] overflow-y-auto relative "
      >
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />

        {files.length === 0 && (
          <span className="text-gray-500 text-lg">
            Drag &amp; drop your files here or click to upload
          </span>
        )}

        {/* Files preview */}
        {files.length > 0 && (
          <div className="flex flex-col gap-4 w-full mt-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="border p-3 px-5 rounded-md shadow-md bg-white flex flex-col items-start w-fit"
              >
                <div className="flex w-full justify-between items-center">
                  <p className="font-bold text-sm px-4">{file.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="text-red-600 font-semibold"
                  >
                    ✖
                  </button>
                </div>
                {previews[index] && (
                  <div className="w-full mt-2 flex justify-center">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={previews[index] || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-24 object-cover rounded-md"
                      />
                    ) : file.type === "application/pdf" ? (
                      <iframe
                        src={`${previews[index]}#page=1&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0`}
                        title="PDF Preview"
                        className="pdf-preview w-full border rounded-md
                                   [&::-webkit-scrollbar]:hidden scrollbar-none"
                        style={{
                          height: "100px",
                          overflow: "hidden",
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">
                        Unsupported file type
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Button Div */}
      <div>
        <button
          onClick={simulateChainOfThought}
          className="
            px-5
            py-2
            bg-orange-600
            hover:bg-orange-500
            text-white
            font-medium
            rounded-md
            transition-colors
            duration-200
            flex items-center justify-center
            mt-7
            cursor-pointer
          "
          disabled={isLoading || files.length === 0} // disable if already processing or no files
        >
          {isLoading ? "Processing..." : "Next Step"}
        </button>
      </div>

      {/* Display chain-of-thought if steps are set */}
      {chainOfThought.length > 0 && (
        <ChainOfThoughtProgress
          chainOfThought={chainOfThought}
          currentStep={currentStep}
        />
      )}

      {finalJson && (
        <CreditList finalJson={finalJson} currenState={isLoading} />
      )}
    </div>
  );
};

export default Droparea;
