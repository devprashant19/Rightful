export interface TestCase {
  id: string;
  name: string;
  seller: string;
  claim_type: "return" | "refund" | "warranty" | "wrong_item" | "damaged";
  problem: string;
  inputText: string;
  policyUrl?: string;
  isFictional: boolean;
}

export const SAMPLE_CASES: TestCase[] = [
  {
    id: "voltline-earbuds",
    name: "Voltline Earbuds (Fictional - Benchmark)",
    seller: "Voltline Electronics",
    claim_type: "warranty",
    problem: "Right earbud stopped charging after 19 days of normal use.",
    inputText: `ORDER CONFIRMATION (SAMPLE)
Order Reference: DEMO-VL-89412
Date: 2026-10-09
Delivery Date: 2026-10-12
Item: AeroSound Pro Wireless Earbuds
Color: Matte Black
Amount: $129.99 USD
Payment: Credit Card ending in 4102
Status: Delivered`,
    policyUrl: "/policies/voltline",
    isFictional: true,
  },
  {
    id: "apple-magic-mouse",
    name: "Apple Magic Mouse (Live Research)",
    seller: "Apple",
    claim_type: "return",
    problem: "Unopened mouse, want to return within standard 14-day holiday window.",
    inputText: `Purchased an Apple Magic Mouse (White) from Apple Store Online on 2026-10-22. Delivered on 2026-10-24. Order W10829140. Packaging is completely unopened and shrinkwrapped. Total $79.00.`,
    isFictional: false,
  },
  {
    id: "bestbuy-tv",
    name: "Best Buy Television (Live Research)",
    seller: "Best Buy",
    claim_type: "damaged",
    problem: "TV arrived with a cracked screen straight out of the delivery box.",
    inputText: `Order BBY01-9982412 for 55-inch 4K TV. Delivered yesterday, 2026-10-27. Opened the carton today and found the OLED panel has a spiderweb crack across the lower corner.`,
    isFictional: false,
  },
  {
    id: "zara-jacket",
    name: "Zara Leather Jacket (Live Research)",
    seller: "Zara",
    claim_type: "wrong_item",
    problem: "Ordered black leather jacket size L, received brown suede jacket size S.",
    inputText: `Zara Order #5291048821. Delivered on 2026-10-20. The package contained a totally wrong item: Men's Brown Suede Jacket in Size S instead of the Black Leather Jacket in Size L that was paid for ($189.00).`,
    isFictional: false,
  },
];

