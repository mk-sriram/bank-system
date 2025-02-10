type CreditLevel = "approved" | "declined" | "underReview";

export interface CreditItem {
  name: string;
  creditLevel: CreditLevel;
  riskLevel?: "low" | "high";
  description: string[];
}

export type CreditListProps = {
  finalJson: CreditItem[];
  isLoading: boolean;
};
