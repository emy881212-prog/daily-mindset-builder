"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^[ '\"]|[ '\"]$/g, "");
  }
}

const base = "https://api-m.sandbox.paypal.com";
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) throw new Error("Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env first.");

async function token() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!response.ok) throw new Error("Could not authenticate with PayPal.");
  return (await response.json()).access_token;
}

async function api(accessToken, endpoint, body) {
  const response = await fetch(`${base}${endpoint}`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "PayPal-Request-Id": crypto.randomUUID() }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(`${data.message || "PayPal request failed"}: ${JSON.stringify(data.details || [])}`);
  return data;
}

const prices = {
  standard: { monthly: "4.99", yearly: "49.99" },
  premium: { monthly: "8.99", yearly: "89.99" },
  pro: { monthly: "14.99", yearly: "149.99" }
};

(async () => {
  const accessToken = await token();
  const product = await api(accessToken, "/v1/catalogs/products", { name: "Daily Mindset Builder Membership", description: "Personalized wellness and motivation membership", type: "SERVICE", category: "SOFTWARE" });
  const output = {};
  for (const [tier, amounts] of Object.entries(prices)) {
    for (const [cadence, value] of Object.entries(amounts)) {
      const interval = cadence === "monthly" ? "MONTH" : "YEAR";
      const plan = await api(accessToken, "/v1/billing/plans", {
        product_id: product.id,
        name: `${tier[0].toUpperCase()}${tier.slice(1)} ${cadence}`,
        description: `${tier} membership billed ${cadence}`,
        status: "ACTIVE",
        billing_cycles: [{ frequency: { interval_unit: interval, interval_count: 1 }, tenure_type: "REGULAR", sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value, currency_code: "USD" } } }],
        payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 1 }
      });
      output[`PAYPAL_PLAN_${tier.toUpperCase()}_${cadence.toUpperCase()}`] = plan.id;
    }
  }
  console.log("Plans created. Add these IDs to .env:\n");
  for (const [key, value] of Object.entries(output)) console.log(`${key}=${value}`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
