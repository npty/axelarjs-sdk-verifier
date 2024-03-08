import { formatEther } from "ethers/lib/utils";
import estimateDestL1Fees from "./estimateDestL1Chain";
import estimateDestL2Fees from "./estimateDestL2Chain";

function formatFee(src: string, dest: string, fee: string) {
  return `${src} -> ${dest}: ${formatEther(fee)}`;
}

export default async function run() {
  const feeResponse = await estimateDestL1Fees();
  console.log("========== L2 -> L1 fee estimations ==========");
  for (const [src, dest, fee] of feeResponse) {
    console.log(formatFee(src, dest, fee));
  }

  console.log("\n========== L1 -> L2 fee estimations ==========");
  const feeResponse2 = await estimateDestL2Fees();
  for (const feeRes of feeResponse2) {
    const [src, dest, fee] = feeRes;
    console.log(formatFee(src, dest, fee));
  }
}
