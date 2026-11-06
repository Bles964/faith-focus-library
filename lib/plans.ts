// Save as: lib/plans.ts   (replace the old one)

// "transfer" = students pay your bank account and you confirm by hand.
// "paystack" = automatic card/transfer payments through Paystack.
export const PAYMENT_MODE: "transfer" | "paystack" = "transfer";

// CHANGE THESE to your own bank details. Students will see them.
export const BANK = {
  bankName: "OPAY",
  accountNumber: "8105589718",
  accountName: "OPARA BLESSSING CHINOCHIRI",
};

// CHANGE THE PRICES to what you charge. Amounts are in naira.
export const PLANS = [
  { id: "month", label: "1 month", days: 30, amountNgn: 1500 },
  { id: "quarter", label: "3 months", days: 90, amountNgn: 5000 },
];
