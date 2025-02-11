export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

import { processExtractionFile, processAnalyzerData } from "./helper";

// Initialize the Google Generative AI client.
const initializeGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: NextRequest) {
  console.log("API POST request received");

  try {
    const genAI = initializeGenAI();
    const formData = await request.formData();

    // Assume multiple files are attached under the "files" key.
    const fileFields = formData.getAll("files");
    if (!fileFields || fileFields.length === 0) {
      console.error("No file provided in the request.");
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Process each file to extract the bank statement data.
    const extractionResults = await Promise.all(
      fileFields.map((file) => processExtractionFile(file, genAI))
    );
    //console.log("Extraction Results:", extractionResults);

    // Process each extracted result using the analyzer prompt.
    const analyzerResults = await Promise.all(
      extractionResults.map((extractedData) =>
        processAnalyzerData(extractedData, genAI)
      )
    );
    console.log("Analyzer Results:", analyzerResults);

    return NextResponse.json({ text: analyzerResults }, { status: 200 });
  } catch (error) {
    console.error("Error processing files:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
