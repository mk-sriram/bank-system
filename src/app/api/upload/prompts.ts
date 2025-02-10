import { SchemaType } from "@google/generative-ai";

export const BankStatementAnalyzerPrompt = `
You are the Creditworthiness Analysis Agent. Your task is to analyze a bank statement's transactional data and determine the creditworthiness of an individual using a fixed scoring system with predetermined thresholds.

### Input Data:
The input is provided as a JSON object that conforms to the following structure:
{
  "metadata": {
    "accountNumber": "<string, account number extracted from the bank statement>",
    "fileName": "<string, file name of the bank statement>",
    "personName": "<string, name of the account holder>"
  },
  "transactions": [
    {
      "Date": "<string, the date of the transaction in MMDDYY format (e.g., '101517' for October 15, 2017)>",
      "TransactionDescription": "<string, the full description of the transaction>",
      "Amount": <number, the transaction amount (negative for debits, positive for credits)>,
      "Balance": <number, the account balance after the transaction>
    },
    // ... additional transactions
  ]
}

### Data Parsing & Preprocessing:
- Extract metadata fields: accountNumber, fileName, and personName.
- For each transaction in the "transactions" array, use the provided fields:
  - **Date:** Already in MMDDYY format.
  - **TransactionDescription:** Use the full transaction description as provided.
  - **Amount:** Use the numeric value directly (ensure debits are negative and credits are positive).
  - **Balance:** Use the numeric value representing the account balance after the transaction.

### Fixed Scoring System & Thresholds:
1. **Initialize Base Score:**
   - Start with a base credit score of **100**.

2. **Positive Contributions:**
   - For each transaction classified as a consistent deposit (e.g., if TransactionDescription contains "Direct Credit" or "Transfer from"), **add 10 points**.
   - For maintaining a high average balance (above a calculated threshold), **add 5 points**.

3. **Negative Contributions:**
   - For each transaction classified as a fee (e.g., if TransactionDescription contains "Account Fee") or an overdraft occurrence, **subtract 10 points**.
   - For each transaction that is a large or irregular withdrawal (if a withdrawal exceeds 20% of the average balance), **subtract 15 points**.
3.5. NOrmaliation of the values
    - finally divide the credit score by the total number of transactions , this is your actual credit score value
4. **Final Score & Decision Thresholds:**
   - **Approved:** If the final credit score is **120 or above**.
   - **UnderReview:** If the final credit score is **between 90 and 119**. In this case, assign a risk level as follows:
       - "low" risk if the score is between **106 and 119**.
       - "medium" risk if the score is between **96 and 105**.
       - "high" risk if the score is between **90 and 95**.
   - **Declined:** If the final credit score is **below 90**.

### Output Requirements:
Your final output must be a valid JSON object that adheres to the following structure:
{
  "accountNumber": "<extracted account number from metadata>",
  "creditLevel": "<approved | underReview | declined>",
  "riskLevel": "<low | medium | high>", // Only applicable if creditLevel is 'underReview'; otherwise, this can be null.
  "description": [ "<detailed explanation of the factors, calculations, and thresholds used>" ]
}

### Instructions for Analysis:
- Thoroughly explain how you classified each transaction and assigned the corresponding weights.
- Detail how you calculated total inflows, outflows, and net cash flow from the transactions.
- Explain how balance trends (average, minimum, maximum) influenced the credit score.
- Provide a step-by-step explanation in the "description" array, including how the base score was adjusted with each positive and negative contribution.
- Use the fixed scoring adjustments and thresholds defined above to compute the final credit score and decide the credit level.

Now, analyze the provided input data accordingly and output your results in the specified JSON format.
`;

export const dataExtractionPrompt = `
Identify the metadata and each individual transaction entry within the bank statement.

### Metadata Extraction:
Extract the following metadata fields from the bank statement:
- **accountNumber:** The account number extracted from the bank statement.
- **fileName:** The file name of the bank statement.
- **personName:** The name of the account holder.

### Transaction Extraction:
For each transaction entry, extract the following fields:
- **Date:** The date of the transaction, converted to the MMDDYY format (e.g., "101517" for October 15, 2017).
- **TransactionDescription:** The full description of the transaction (e.g., "Alinta Sales Pty Ltd NetBank BPAY 2733 0400032246").
- **Amount:** The transaction amount, with debit amounts as negative numbers (e.g., -50.00) and credit amounts as positive numbers (e.g., 1000.00).
- **Balance:** The account balance after the transaction, represented as a number (remove any non-numeric characters).

### Output Format:
The output must be a JSON array containing exactly two elements:
1. **Metadata Object:** A JSON object with the keys "accountNumber", "fileName", and "personName".
2. **Transactions Array:** A JSON array where each element is a JSON object representing a single transaction. Each transaction object must include the keys "Date", "TransactionDescription", "Amount", and "Balance".

#### Example JSON Output:
[
  {
    "accountNumber": "123456789",
    "fileName": "statement_oct2017.pdf",
    "personName": "John Doe"
  },
  [
    {
      "Date": "101517",
      "TransactionDescription": "Alinta Sales Pty Ltd NetBank BPAY 2733 0400032246",
      "Amount": -50.00,
      "Balance": 2167.29
    },
    {
      "Date": "102317",
      "TransactionDescription": "VIRGIN MONEY NetBank BPAY 49551 4724373501635385",
      "Amount": 1000.00,
      "Balance": 1167.29
    }
  ]
]

Please output only the JSON array in the format specified above, with no additional commentary or text.
`;

export const BankStatementAnalyzerSchema: any = {
  description:
    "Analysis of a bank statement for a single account's creditworthiness",
  type: SchemaType.OBJECT,
  properties: {
    accountNumber: {
      type: SchemaType.STRING,
      description: "Actual account number extracted from the bank statement",
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

export const DataExtractionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    metadata: {
      type: SchemaType.OBJECT,
      description: "Metadata extracted from the bank statement",
      properties: {
        accountNumber: {
          type: SchemaType.STRING,
          description: "The account number extracted from the bank statement",
        },
        fileName: {
          type: SchemaType.STRING,
          description: "The file name of the bank statement",
        },
        personName: {
          type: SchemaType.STRING,
          description: "The name of the account holder",
        },
      },
      required: ["accountNumber", "fileName", "personName"],
    },
    transactions: {
      type: SchemaType.ARRAY,
      description: "Array of individual transaction entries",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          Date: {
            type: SchemaType.STRING,
            description:
              "The date of the transaction in MMDDYY format (e.g., '101517' for October 15, 2017)",
          },
          TransactionDescription: {
            type: SchemaType.STRING,
            description: "The full description of the transaction",
          },
          Amount: {
            type: SchemaType.NUMBER,
            description:
              "The transaction amount (negative for debits, positive for credits)",
          },
          Balance: {
            type: SchemaType.NUMBER,
            description:
              "The account balance after the transaction, represented as a number",
          },
        },
        required: ["Date", "TransactionDescription", "Amount", "Balance"],
      },
    },
  },
  required: ["metadata", "transactions"],
};
// export const BankTransactionsSchema = {
//   description: "Extracted bank transactions from a bank statement",
//   type: SchemaType.ARRAY,
//   items: {
//     type: SchemaType.OBJECT,
//     properties: {
//       Date: {
//         type: SchemaType.STRING,
//         description:
//           "The date of the transaction in MMDDYY format (e.g., '101517' for October 15, 2017)",
//       },
//       TransactionDescription: {
//         type: SchemaType.STRING,
//         description:
//           "The full description of the transaction (e.g., 'Alinta Sales Pty Ltd NetBank BPAY 2733 0400032246')",
//       },
//       Amount: {
//         type: SchemaType.NUMBER,
//         description:
//           "The transaction amount (negative for debits, positive for credits)",
//       },
//       Balance: {
//         type: SchemaType.NUMBER,
//         description:
//           "The account balance after the transaction, represented as a number",
//       },
//     },
//     required: ["Date", "TransactionDescription", "Amount", "Balance"],
//   },
// };
