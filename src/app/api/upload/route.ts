// app/api/upload/route.ts

export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

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
const validateGeneratedJson = (text: string): object | null => {
  try {
    const data = JSON.parse(text);

    // Validate accountNumber: it should be a string starting with "ACC-"
    if (
      typeof data.accountNumber !== "string" ||
      !data.accountNumber.startsWith("ACC-")
    ) {
      console.error(
        "Validation error: accountNumber missing or invalid",
        data.accountNumber
      );
      return null;
    }

    // Validate creditLevel: must be one of the allowed values.
    if (!["approved", "declined", "underReview"].includes(data.creditLevel)) {
      console.error("Validation error: creditLevel invalid", data.creditLevel);
      return null;
    }

    // Validate riskLevel:
    // - If creditLevel is "underReview", riskLevel must be one of the allowed values.
    // - Otherwise, riskLevel should be null.
    if (data.creditLevel === "underReview") {
      if (!["low", "medium", "high"].includes(data.riskLevel)) {
        console.error(
          "Validation error: riskLevel invalid for underReview",
          data.riskLevel
        );
        return null;
      }
    } else if (data.riskLevel !== null) {
      console.error(
        "Validation error: riskLevel should be null for approved/declined",
        data.riskLevel
      );
      return null;
    }

    // Validate description: must be an array of strings.
    if (
      !Array.isArray(data.description) ||
      !data.description.every((item: any) => typeof item === "string")
    ) {
      console.error(
        "Validation error: description is not an array of strings",
        data.description
      );
      return null;
    }

    return data;
  } catch (e) {
    console.error("Validation error: Could not parse JSON", e);
    return null;
  }
};

export async function POST(request: NextRequest) {
  console.log("API POST request received");

  try {
    const genAI = initializeGenAI();

    // Retrieve the form data from the request
    const formData = await request.formData();

    // Try to get the file from either "file" or "files"
    const fileField = formData.get("file") || formData.get("files");
    if (!fileField) {
      console.error("No file provided in the request.");
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Cast the file to a Blob and log some file info
    const fileBlob = fileField as Blob;
    console.log("Received file:", fileBlob);
    console.log("File type:", fileBlob.type);

    // Check file type – only allow PDF, PNG, or JPEG files
    if (
      !["application/pdf", "image/png", "image/jpeg"].includes(fileBlob.type)
    ) {
      console.error("Invalid file type:", fileBlob.type);
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, PNG, and JPEG are allowed." },
        { status: 400 }
      );
    }

    // Convert the file to base64
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = buffer.toString("base64");

    // Prepare JSON Schema for the Gemini API

    const schema = {
      description:
        "Analysis of a bank statement for a single account's creditworthiness",
      type: SchemaType.OBJECT,
      properties: {
        accountNumber: {
          type: SchemaType.STRING,
          description:
            "Actual account number extracted from the bank statement",
        },
        creditLevel: {
          type: SchemaType.STRING,
          enum: ["approved", "declined", "underReview"],
          description: "Credit decision for the account holder",
        },
        riskLevel: {
          type: SchemaType.STRING,
          enum: ["low", "medium", "high"],
          description: "Risk level if creditLevel is 'underReview'",
          nullable: true,
        },
        description: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "List of reasons supporting the credit decision",
        },
      },
      required: ["accountNumber", "creditLevel", "description"],
    };

    // Minimal prompt text instructing the model to analyze and output JSON per the schema.
    const promptText =
      "Analyze the provided bank statement and output a JSON object that adheres to the provided schema.";

    // Prepare the parts with the file data and prompt text.
    const parts = [
      {
        inlineData: {
          mimeType: fileBlob.type,
          data: base64File,
        },
      },
      {
        text: promptText,
      },
    ];

    // Get the generative model with the response schema in the generation configuration.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Generate content with the model
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const generatedResponse = result.response;
    // Await the text extraction (in case it's asynchronous)
    const generatedText = await generatedResponse.text();

    if (!generatedText) {
      console.warn("Warning: Generated text is empty or null.");
      return NextResponse.json(
        { error: "No content generated. Retry your request!" },
        { status: 204 }
      );
    }

    console.log("Generated text:", generatedText);

    // Validate the generated text against our expected JSON schema.
    // const validatedData = validateGeneratedJson(generatedText);
    // if (!validatedData) {
    //   console.error(
    //     "Validation failed: The generated JSON did not match the expected schema."
    //   );
    //   return NextResponse.json(
    //     { error: "Generated JSON did not match the expected schema." },
    //     { status: 500 }
    //   );
    // }

    const jsonParse = JSON.parse(generatedText);

    return NextResponse.json({ text: jsonParse }, { status: 200 });
  } catch (error) {
    console.error("Error processing file:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
