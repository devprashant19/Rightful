import { NextResponse } from "next/server";

export async function GET() {
  const policyText = `
VOLTLINE ELECTRONICS - CONSUMER WARRANTY & RETURNS POLICY (Rev. 2026.1)

1. 30-DAY RETURN POLICY
Voltline Electronics provides a 30-day return policy from the date of delivery for all consumer audio products. Items in original condition may be returned for a full refund or replacement. Proof of purchase is required.

2. ONE-YEAR LIMITED HARDWARE WARRANTY
All Voltline hardware products carry a 1-year limited warranty against manufacturing defects from the date of purchase. If a defect occurs during normal intended use, Voltline will repair or replace the unit free of charge.

3. DEFECT VERIFICATION REQUIREMENTS
For warranty claims on audio products failing to charge or maintain power, proof of defect via photo or short video is required before a return merchandise authorization (RMA) is generated.

4. PACKAGING
Original retail packaging is encouraged but is not required for verified warranty claims involving hardware defects.
`;

  return new NextResponse(policyText.trim(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

