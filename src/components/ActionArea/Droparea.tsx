"use client";

import type React from "react";
import { useState } from "react";
import Output from "./Output";

const Droparea = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [chainOfThought, setChainOfThought] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map((file) => {
      return URL.createObjectURL(file);
    });
    setPreviews(newPreviews);
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
    setFiles(droppedFiles);
    const newPreviews = droppedFiles.map((file) => {
      return URL.createObjectURL(file);
    });
    setPreviews(newPreviews);
  };

  const triggerFileInput = () => {
    document.getElementById("dropzone-file")?.click();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    setFiles(files);
    const newPreviews = files.map((file) => {
      return URL.createObjectURL(file);
    });
    setPreviews(newPreviews);
  };

  const simulateChainOfThought = async () => {
    setIsLoading(true);
    setChainOfThought([]);
    setJsonData(null);

    const steps = [
      "Analyzing file contents...",
      "Extracting relevant information...",
      "Applying natural language processing...",
      "Identifying key entities and relationships...",
      "Generating insights...",
      "Summarizing findings...",
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChainOfThought((prev) => [...prev, step]);
    }

    // Simulate final output
    const simulatedOutput = {
      summary: "Analysis complete",
      entities: ["Entity A", "Entity B", "Entity C"],
      relationships: ["A is related to B", "B influences C"],
      insights: ["Insight 1", "Insight 2", "Insight 3"],
    };

    setJsonData(simulatedOutput);
    setIsLoading(false);
  };

  const handleNextStep = () => {
    simulateChainOfThought();
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
                   p-4 h-auto max-h-[50vh] min-h-[200px] overflow-y-auto relative"
      >
        {/* Hidden input for file selection */}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />

        {/* File Previews inside the drop area */}
        {files.length > 0 && (
          <div className="flex flex-col gap-4 w-full mt-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="border p-3 rounded-md shadow-md bg-white flex flex-col items-start w-full"
              >
                <div className="flex w-full justify-between items-center">
                  <p className="font-bold text-sm">{file.name}</p>
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
                          height: "200px",
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

      {files.length > 0 && (
        <button
          onClick={handleNextStep}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Next Step"}
        </button>
      )}

      {/* Chain of Thought */}
      {chainOfThought.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Analysis Progress:</h3>
          <ul className="space-y-2">
            {chainOfThought.map((step, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 bg-gray-100 p-2 rounded"
              >
                <span className="text-green-500">✓</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Output */}
      {jsonData && <Output jsonData={jsonData} />}
    </div>
  );
};

export default Droparea;
