"use client";

import type React from "react";
import { createContext, useState, useContext } from "react";

type AnalysisContextType = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  analysisSteps: string[];
  setAnalysisSteps: React.Dispatch<React.SetStateAction<string[]>>;
  creditworthinessData: Array<{
    name: string;
    risk: string;
    reasoning: string;
  }>;
  setCreditworthinessData: React.Dispatch<
    React.SetStateAction<
      Array<{ name: string; risk: string; reasoning: string }>
    >
  >;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [creditworthinessData, setCreditworthinessData] = useState<
    Array<{ name: string; risk: string; reasoning: string }>
  >([]);

  return (
    <AnalysisContext.Provider
      value={{
        files,
        setFiles,
        isProcessing,
        setIsProcessing,
        analysisSteps,
        setAnalysisSteps,
        creditworthinessData,
        setCreditworthinessData,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};
