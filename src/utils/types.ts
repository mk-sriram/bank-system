type CreditLevel = "approved" | "declined" | "underReview";

export interface CreditItem {
  accountNumber: string;
  creditLevel: CreditLevel;
  riskLevel?: "low" | "high";
  description: string[];
}

export type CreditListProps = {
  finalJson: CreditItem[];
  currenState: boolean;
};
