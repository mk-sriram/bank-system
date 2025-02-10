// app/api/upload/route.ts

export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { dataExtractionPrompt, DataExtractionSchema } from "./prompts";
// Initialize the Google Generative AI client
const initializeGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Validate that the generated text is a valid JSON matching our schema.
// const validateGeneratedJson = (text: string): object | null => {
//   try {
//     const data = JSON.parse(text);

//     // Validate accountNumber: it should be a string starting with "ACC-"
//     if (
//       typeof data.accountNumber !== "string" ||
//       !data.accountNumber.startsWith("ACC-")
//     ) {
//       console.error(
//         "Validation error: accountNumber missing or invalid",
//         data.accountNumber
//       );
//       return null;
//     }

//     // Validate creditLevel: must be one of the allowed values.
//     if (!["approved", "declined", "underReview"].includes(data.creditLevel)) {
//       console.error("Validation error: creditLevel invalid", data.creditLevel);
//       return null;
//     }

//     // Validate riskLevel:
//     // - If creditLevel is "underReview", riskLevel must be one of the allowed values.
//     // - Otherwise, riskLevel should be null.
//     if (data.creditLevel === "underReview") {
//       if (!["low", "medium", "high"].includes(data.riskLevel)) {
//         console.error(
//           "Validation error: riskLevel invalid for underReview",
//           data.riskLevel
//         );
//         return null;
//       }
//     } else if (data.riskLevel !== null) {
//       console.error(
//         "Validation error: riskLevel should be null for approved/declined",
//         data.riskLevel
//       );
//       return null;
//     }

//     // Validate description: must be an array of strings.
//     if (
//       !Array.isArray(data.description) ||
//       !data.description.every((item: any) => typeof item === "string")
//     ) {
//       console.error(
//         "Validation error: description is not an array of strings",
//         data.description
//       );
//       return null;
//     }

//     return data;
//   } catch (e) {
//     console.error("Validation error: Could not parse JSON", e);
//     return null;
//   }
// };

export async function POST(request: NextRequest) {
  console.log("API POST request received");

  try {
    const genAI = initializeGenAI();
    const formData = await request.formData();

    // Assume multiple files are attached under the "files" key
    const fileFields = formData.getAll("files");
    if (!fileFields || fileFields.length === 0) {
      console.error("No file provided in the request.");
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Function to process a single file
    const processFile = async (fileField: any) => {
      // Cast the file to a Blob
      const fileBlob = fileField as Blob;
      if (
        !["application/pdf", "image/png", "image/jpeg"].includes(fileBlob.type)
      ) {
        throw new Error(
          "Invalid file type. Only PDF, PNG, and JPEG are allowed."
        );
      }
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64File = buffer.toString("base64");

      // Prepare JSON Schema and prompt

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

      // Get the generative model with the schema in the generation configuration.
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
        throw new Error("No content generated for a file.");
      }

      // Optionally, validate the JSON here
      return JSON.parse(generatedText);
    };

    // Process all files concurrently
    const results = await Promise.all(
      fileFields.map((file) => processFile(file))
    );
    console.log("Combined results:", results);

    // return NextResponse.json({ text: results }, { status: 200 });
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
