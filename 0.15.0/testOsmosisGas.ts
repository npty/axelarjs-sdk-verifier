import {
  AxelarQueryAPI,
  AxelarQueryAPIFeeResponse,
  Environment,
} from "@axelar-network/axelarjs-sdk";

console.warn = () => {};

const GAS_MULTIPLIER = 1;

function getGasLimit(destChain: string) {
  switch (destChain) {
    case "mantle":
      return 703_182_912; // https://explorer.mantle.xyz/tx/0xd4f6627648dd7d4ab23537ae9020915c5ee870c8260938f13d9685b46a16a237
    case "optimism":
      return 118_406; // https://optimistic.etherscan.io/tx/0xa690c312d7535718a3ed5890855be32f1c6776c6f12dfa16485e058fbe1af5e2
    case "blast":
      return 211_356; // https://blastscan.io/tx/0xd15a62a0231f3907cf9406b61f1ca134e931d9b7244813fca476e5664cfb42df
    case "fraxtal":
      return 111_840; // https://fraxscan.com/tx/0xc8dbb8fecc8355422be4c6706e1a280cf8e98f1e1044d554ee4abac2e60f1668
    case "scroll":
      return 128_415; // https://scrollscan.com/tx/0x622e1de9ce9f8617717430dc08e3202a39cfeb3a45cde4870b9b53632dacf9c8
    case "base":
      return 112_298; // https://basescan.org/tx/0xad7f09d9fc648eef78fa08107b576e948ccf1f78d6149aff1b8273e535f1fbe8
    case "arbitrum":
      return 382_910; // https://arbiscan.io/tx/0x8b173ad2743f71fe11c4f8286f082eaca4e87f0a0c1ab5475ddfeea06a76a5b6
    default:
      return 200_000;
  }
}

async function sdkEstimate(
  env: Environment,
  srcChain: string,
  destChain: string
) {
  const client = new AxelarQueryAPI({
    environment: env,
  });
  const gasLimit = getGasLimit(destChain);

  const fee = await client.estimateGasFee(
    srcChain,
    destChain,
    gasLimit,
    "auto",
    undefined,
    undefined,
    undefined,
    {
      showDetailedFees: true,
      destinationContractAddress: "",
      sourceContractAddress: "",
      tokenSymbol: "",
    }
  );

  const feeDetails = fee as AxelarQueryAPIFeeResponse;

  return {
    baseFee: feeDetails.baseFee,
    executionFee: feeDetails.executionFee,
    l1ExecutionFee: feeDetails.l1ExecutionFee,
    gasPrice:
      feeDetails.apiResponse.result.destination_native_token.gas_price_in_units
        .value,
    l1GasPrice:
      feeDetails.apiResponse.result.destination_native_token
        .l1_gas_price_in_units?.value || "0",
  };
}

const defaultDestChains = ["osmosis-7"];

export default async function test(destChains: string[] = defaultDestChains) {
  const srcChain = "sei-2";

  const pendingSdkFees = destChains.map((destChain) =>
    sdkEstimate(Environment.TESTNET, srcChain, destChain)
  );

  return await Promise.all(pendingSdkFees);
}
