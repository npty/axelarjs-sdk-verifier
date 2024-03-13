import { AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import { GAS_LIMIT, MAINNET_L1_CHAINS, MAINNET_L2_CHAINS } from "./constants";

async function estimate(srcChain: string, destChain: string) {
  const sdk = new AxelarQueryAPI({
    environment: Environment.MAINNET,
  });

  const fee = await sdk.estimateGasFee(
    srcChain,
    destChain,
    GAS_LIMIT,
    "auto",
    undefined,
    undefined,
    "0x"
  );

  return fee as string;
}

export default async function run() {
  const chainPairs = MAINNET_L2_CHAINS.map((l2chain, index) => [
    l2chain,
    MAINNET_L1_CHAINS[index],
  ]);
  const fees = await Promise.all(
    chainPairs.map(([src, dest]) => estimate(src, dest))
  );

  return fees.map((fee, i) => [
    chainPairs[i][0],
    chainPairs[i][1],
    fee as string,
  ]);
}
