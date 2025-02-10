import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Buffer } from "buffer";
import {
  dataExtractionPrompt,
  DataExtractionSchema,
  BankStatementAnalyzerPrompt,
  BankStatementAnalyzerSchema,
} from "./prompts";

/**
 * Process a file to extract bank statement data (metadata and transactions).
 * The output conforms to DataExtractionSchema.
 */
export const processExtractionFile = async (fileField: any, genAI: any) => {
  // Cast the file to a Blob.
  const fileBlob = fileField as Blob;
  if (!["application/pdf", "image/png", "image/jpeg"].includes(fileBlob.type)) {
    throw new Error("Invalid file type. Only PDF, PNG, and JPEG are allowed.");
  }
  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64File = buffer.toString("base64");

  const parts = [
    {
      inlineData: {
        mimeType: fileBlob.type,
        data: base64File,
      },
    },
    {
      text: dataExtractionPrompt,
    },
  ];

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: DataExtractionSchema,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const generatedResponse = result.response;
  const generatedText = await generatedResponse.text();

  if (!generatedText) {
    throw new Error("No content generated for the extraction file.");
  }
  return JSON.parse(generatedText);
};

/**
 * Process the extracted bank statement JSON data through the analyzer prompt.
 * The input is a JSON object adhering to DataExtractionSchema.
 * The output will conform to BankStatementAnalyzerSchema.
 */
export const processAnalyzerData = async (extractedData: any, genAI: any) => {
  // Convert the extracted JSON data to a string so it can be passed as text.
  const inputJSON = JSON.stringify(extractedData);
  const parts = [
    {
      // Pass the extracted JSON data as text.
      text: inputJSON,
    },
    {
      text: BankStatementAnalyzerPrompt,
    },
  ];

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: BankStatementAnalyzerSchema,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const generatedResponse = result.response;
  const generatedText = await generatedResponse.text();

  if (!generatedText) {
    throw new Error("No content generated for the analyzer data.");
  }
  return JSON.parse(generatedText);
};
