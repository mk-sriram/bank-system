// components/DropArea.tsx
"use client";

import React from "react";
import FileDropzone from "./FileDropZone";
import ChainOfThoughtProgress from "./ChainOfThoughtProgress";
import CreditList from "./CreditList";
import useUploadSimulation from "@/hooks/useUploadSimulation";

const DropArea = () => {
  const {
    files,
    setFiles,
    previews,
    setPreviews,
    isLoading,
    jsonData,
    chainOfThought,
    currentStep,
    simulateChainOfThought,
  } = useUploadSimulation();

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center w-full pb-7 mb-9">
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

export default DropArea;
