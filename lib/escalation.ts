export interface EscalationOption {
  tier: number;
  channel: string;
  authority: string;
  guidance: string;
  formalCitation?: string;
  badge: string;
}

export function getEscalationLadder(claimType: string, isIndia: boolean): EscalationOption[] {
  const ladder: EscalationOption[] = [
    {
      tier: 1,
      channel: "Marketplace / Platform Dispute",
      authority: "Platform Buyer Protection",
      guidance:
        "File an A-to-z or Buyer Protection dispute on the platform. State clearly that the merchant is violating their own published return/warranty policy.",
      badge: "Fastest Resolution",
    },
    {
      tier: 2,
      channel: "Bank Card Chargeback",
      authority: "Visa / Mastercard / Amex",
      guidance:
        "Initiate a chargeback dispute under Reason Code 53 / 4853 ('Defective Merchandise or Not as Described'). Attach the Rightful Claim Pack as documentary proof of attempt to resolve.",
      badge: "Direct Financial Remedy",
      formalCitation: "Chargeback Reason Code 4853 / Condition 13.1",
    },
  ];

  if (isIndia) {
    ladder.push({
      tier: 3,
      channel: "National Consumer Helpline (NCH)",
      authority: "Ministry of Consumer Affairs, Government of India",
      guidance:
        "Dial 1915 or register grievance on consumerhelpline.gov.in. Cites Consumer Protection Act 2019 for 'Deficiency in Service' and 'Unfair Trade Practice'.",
      badge: "Statutory Authority",
      formalCitation: "Section 2(11) & 2(47), Consumer Protection Act 2019",
    });
    ladder.push({
      tier: 4,
      channel: "e-Daakhil Digital Consumer Commission",
      authority: "National Consumer Disputes Redressal Commission (NCDRC)",
      guidance:
        "File an online consumer complaint directly via edaakhil.nic.in without physical court attendance or lawyer requirements. Submit the verified Proof Ledger as Annexure A.",
      badge: "Judicial Redressal",
      formalCitation: "e-Daakhil Portal, Consumer Protection (Consumer Disputes Redressal Commission) Rules 2020",
    });
  } else {
    ladder.push({
      tier: 3,
      channel: "Regulatory Consumer Protection Agency",
      authority: "FTC (US) / State Attorney General / Trading Standards (UK)",
      guidance:
        "Submit a formal consumer fraud and unfair trade practice complaint. Regulatory complaints compel sellers to respond within 14–30 business days.",
      badge: "Enforcement Agency",
      formalCitation: "FTC Act Section 5 / Consumer Rights Act",
    });
    ladder.push({
      tier: 4,
      channel: "Small Claims Court / Civil Money Claim",
      authority: "Local County or District Civil Court",
      guidance:
        "File an inexpensive simplified small claims action. Attach the Rightful Claim Pack as conclusive evidence of seller's policy breach.",
      badge: "Legal Recourse",
    });
  }

  return ladder;
}

