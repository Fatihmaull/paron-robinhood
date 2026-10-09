import { evaluateTrigger } from "./decide.mjs";

const trigger = process.env.TRADER_BOT_TRIGGER || "auto";
const armed = trigger === "auto" || process.argv.includes("--manual");
const manual = trigger === "manual" || process.argv.includes("--manual");

if (!process.env.TRADER_BOT_PRIVATE_KEY) {
  console.log("Trader bot has no key. Printing the plan only.");
}

const event = manual
  ? { name: "PrimaryBuy", seriesId: process.env.TRADER_BOT_SERIES_ID || "4", buyer: process.env.W_BUY || "0xbuyer" }
  : null;

const decision = evaluateTrigger({
  event,
  seriesId: BigInt(process.env.TRADER_BOT_SERIES_ID || "4"),
  buyer: process.env.W_BUY || "0xbuyer",
  trader: process.env.W_TRD || "0xtrader",
  armed: manual ? true : armed,
  holdingCu: 0n,
  openAsk: false,
});

console.log(`Paron trader bot trigger=${trigger} manual=${manual} fire=${decision.fire} reason=${decision.reason}`);
for (const step of decision.steps) {
  console.log(`${step.id} ${step.method}`);
}
if (!decision.fire && !manual) {
  console.log("Armed bots wait for PrimaryBuy of series 4 from W-BUY. Pass --manual to run the same three transactions once.");
}
if (process.env.TRADER_BOT_PRIVATE_KEY && decision.fire) {
  console.error("Refusing to send. OrderBook and PrimarySale addresses are not in the manifest yet.");
  process.exitCode = 2;
}
