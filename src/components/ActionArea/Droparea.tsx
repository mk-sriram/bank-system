"use client";

import type React from "react";
import { useState } from "react";
import Output from "./Output";
import ChainOfThoughtProgress from "./ChainOfThoughtProgress"; // <-- Our updated progress component

const Droparea = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<any>(null);

  // The entire chain of steps, shown at once
  const [chainOfThought, setChainOfThought] = useState<string[]>([]);
  // currentStep indicates which step is "active" (the rest that are < currentStep are completed)
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
   * Displays all steps at once in gray,
   * then progressively colors each step orange as it completes.
   */
  const simulateChainOfThought = () => {
    setIsLoading(true);
    setJsonData(null);
    setChainOfThought([]); // clear old steps
    setCurrentStep(0); // reset to the beginning

    const steps = [
      "Analyzing file contents...",
      "Extracting relevant information...",
      "Applying natural language processing...",
      "Identifying key entities and relationships...",
      "Generating insights...",
      "Summarizing findings...",
    ];

    // 1) Show all steps immediately in gray
    setChainOfThought(steps);

    // 2) Animate through them using setTimeout recursively (no promises)
    let stepIndex = 0;
    const delay = 2000; // 2 seconds between each step; adjust as needed

    const processStep = () => {
      // Make the step at 'stepIndex' the "active" one
      setCurrentStep(stepIndex);

      stepIndex++;
      if (stepIndex <= steps.length) {
        // Schedule next step
        setTimeout(processStep, delay);
      } else {
        // All steps are completed
        // currentStep = steps.length means the last step is also marked completed
        setCurrentStep(steps.length);

        // Simulated final output
        const simulatedOutput = {
          summary: "Analysis complete",
          entities: ["Entity A", "Entity B", "Entity C"],
          relationships: ["A is related to B", "B influences C"],
          insights: ["Insight 1", "Insight 2", "Insight 3"],
        };
        setJsonData(simulatedOutput);
        setIsLoading(false);
      }
    };

    // Start the chain-of-thought progression
    setTimeout(processStep, delay);
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
                   border-2 border-gray-300 border-dashed rounded-lg cursor-pointer
                   bg-transparent hover:shadow-[inset_0px_0px_20px_4px_#f3f3f3]
                   p-4 h-auto max-h-[50vh] min-h-[200px] overflow-y-auto relative drop-shadow-lg"
      >
        {/* Hidden input for file selection */}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        {/* Conditional placeholder text */}
        {files.length === 0 && (
          <span className="text-gray-500 text-lg">
            Drag &amp; drop your files here or click to upload
          </span>
        )}

        {/* File Previews inside the drop area */}
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

      <div>
        <button
          onClick={simulateChainOfThought}
          className="
            px-5
            py-2
            bg-orange-500
            hover:bg-orange-600
            text-white
            font-medium
            rounded-md
            transition-colors
            duration-200
            flex items-center justify-center
            mt-7
            "
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Next Step"}
        </button>
      </div>

      {/* Chain of Thought Analysis Progress */}
      {chainOfThought.length > 0 && (
        <ChainOfThoughtProgress
          chainOfThought={chainOfThought}
          currentStep={currentStep}
        />
      )}

      {/* Output */}
      {jsonData && <Output jsonData={jsonData} />}
    </div>
  );
};

export default Droparea;
