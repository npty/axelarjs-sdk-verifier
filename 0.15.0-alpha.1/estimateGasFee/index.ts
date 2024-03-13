import { formatEther } from "ethers/lib/utils";
import estimateDestL1Fees from "./estimateDestL1Chain";
import estimateDestL2Fees from "./estimateDestL2Chain";
import { Environment } from "@axelar-network/axelarjs-sdk";

function formatFee(src: string, dest: string, fee: string) {
  return `${src} -> ${dest}: ${formatEther(fee)}`;
}

export default async function run() {
  const l2l1MainnetFees = await estimateDestL1Fees();
  console.log("========== L2 -> L1 fee estimations ==========");
  for (const [src, dest, fee] of l2l1MainnetFees) {
    console.log(formatFee(src, dest, fee));
  }

  console.log("\n========== Mainnet L1 -> L2 fee estimations ==========");
  const l1l2MainnetFees = await estimateDestL2Fees(Environment.MAINNET);
  for (const feeRes of l1l2MainnetFees) {
    const [src, dest, fee] = feeRes;
    console.log(formatFee(src, dest, fee));
  }

  console.log("\n========== Testnet L1 -> L2 fee estimations ==========");
  const l1l2TestnetFees = await estimateDestL2Fees(Environment.TESTNET);
  for (const feeRes of l1l2TestnetFees) {
    const [src, dest, fee] = feeRes;
    console.log(formatFee(src, dest, fee));
  }
}
