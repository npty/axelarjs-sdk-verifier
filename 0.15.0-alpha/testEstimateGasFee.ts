import {
  AxelarQueryAPI,
  AxelarQueryAPIFeeResponse,
  Environment,
} from "@axelar-network/axelarjs-sdk";
import { BigNumber, ethers } from "ethers";
import { estimateTotalGasCost, estimateL1GasCost } from "@mantleio/sdk";

console.warn = () => {};

function getGasLimit(destChain: string) {
  switch (destChain) {
    case "mantle":
      return 703_182_912; // based on a sample tx here https://explorer.mantle.xyz/tx/0xd4f6627648dd7d4ab23537ae9020915c5ee870c8260938f13d9685b46a16a237
    case "optimism":
      return 118_406; // based on execution tx here https://axelarscan.io/gmp/0xfd6ce98b4786d94efa10d6dd656cff410fa0333e13b7d4d0065fbfe5c7d94082:470
    default:
      return 200_000;
  }
}

function getExecuteData(destChain: string) {
  switch (destChain) {
    case "mantle":
      // based on execute data here https://explorer.mantle.xyz/tx/0xd4f6627648dd7d4ab23537ae9020915c5ee870c8260938f13d9685b46a16a237
      return "0x414bf38900000000000000000000000078c1b0c915c4faa5fffa6cabf0219da63d7f4cb8000000000000000000000000201eba5cc46d216ce6dc03f6a759e8e766e956ae00000000000000000000000000000000000000000000000000000000000001f40000000000000000000000001eec842bcd7cb0253e89cb8a1b65aac31952eb240000000000000000000000000000000000000000000000000000000065f81a75000000000000000000000000000000000000000000000000061b31ab352c000000000000000000000000000000000000000000000000000000000000000589c800000000000000000000000000000000001388ffbccf85873aaf33e161ceabcc";
    case "optimism":
      // based on execute data here https://optimistic.etherscan.io/tx/0xa690c312d7535718a3ed5890855be32f1c6776c6f12dfa16485e058fbe1af5e2
      return "0x1a98b2e02c5572c7b09abc5223350776a4442de92517be119b56658fc65f9a101e33544400000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000011600000000000000000000000000000000000000000000000000000000001e1c448000000000000000000000000000000000000000000000000000000000000000762696e616e636500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307863653136463639333735353230616230313337376365374238386635424138433438463844363636000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fe000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004283dbf4482c534248bc14a370e54d73e0a16d7a00000000000000000000000000000000000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000005c0000000000000000000000000000000000000000000000000000000000000074000000000000000000000000000000000000000000000000000000000000009600000000000000000000000000000000000000000000000000000000000000ae00000000000000000000000000000000000000000000000000000000000000d000000000000000000000000000000000000000000000000000000000000000e6000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f4052150000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c316070000000000000000000000000000000000000000000000000000000000000064000000000000000000000000ea749fd6ba492dbc14c24fe8a3d08769229b896c0000000000000000000000000000000000000000000000000000000001e1d34c0000000000000000000000000000000000000000000000000000000001e162b80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb466342c4d449bc9f53a865d5cb90586f405215000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000010000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c316070000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c316070000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb00000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000ea749fd6ba492dbc14c24fe8a3d08769229b896c0000000000000000000000000000000000000000000000000000000001e17b5f000000000000000000000000000000000000000000000000001a2770c22a10c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000010000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb00000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000064000000000000000000000000ea749fd6ba492dbc14c24fe8a3d08769229b896c000000000000000000000000000000000000000000000000001a30d3c4be6704000000000000000000000000000000000000000000000000001e4d61d5ba6c1b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000010000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000242e1a7d4d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000004283dbf4482c534248bc14a370e54d73e0a16d7a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000761786c5553444300000000000000000000000000000000000000000000000000";
    default:
      return undefined;
  }
}

function min(a: BigNumber, b: BigNumber) {
  return a.lt(b) ? a : b;
}

function max(a: BigNumber, b: BigNumber) {
  return a.gt(b) ? a : b;
}

function calculateDiffPercentage(actual: BigNumber, expected: BigNumber) {
  const diff = max(actual, expected).sub(min(actual, expected)).toNumber();
  const percent = (diff / actual.toNumber()) * 100;

  return percent;
}

const actualExecutionFeesByDestChain = {
  optimism: "2540000000000", // https://axelarscan.io/gmp/0xfd6ce98b4786d94efa10d6dd656cff410fa0333e13b7d4d0065fbfe5c7d94082:470
  mantle: "3308330944347", // Copy Transaction Fee (USD amount) from https://explorer.mantle.xyz/tx/0xd4f6627648dd7d4ab23537ae9020915c5ee870c8260938f13d9685b46a16a237, then paste it on the ETH converter https://www.coingecko.com/en/coins/ethereum to get ETH amount
} as any;

async function apiEstimate(srcChain: string, destChain: string) {
  const gasLimit = getGasLimit(destChain);

  const result: any = await fetch(
    "https://api.axelarscan.io/gmp/estimateGasFee",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceChain: srcChain,
        destinationChain: destChain,
        gasLimit: gasLimit,
        executeDta: getExecuteData(destChain),
        showDetailedFees: true,
        gasMultiplier: 1,
      }),
    }
  ).then((res) => res.json());

  return {
    baseFee: result.baseFee,
    totalFee: result.executionFee,
  };
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
    1,
    undefined,
    undefined,
    getExecuteData(destChain),
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
  };
}

export default async function test() {
  const srcChain = "ethereum";
  const destChains = [
    "mantle",
    "optimism",
    "base",
    "scroll",
    "arbitrum",
    "fraxtal",
    "blast",
  ];

  const pendingSdkFees = destChains.map((destChain) =>
    sdkEstimate(Environment.MAINNET, srcChain, destChain)
  );
  const pendingApiFees = destChains.map((destChain) =>
    apiEstimate(srcChain, destChain)
  );

  const sdkFees = await Promise.all(pendingSdkFees);
  const apiFees = await Promise.all(pendingApiFees);

  for (let i = 0; i < sdkFees.length; i++) {
    console.log(
      "\n================================================================="
    );
    console.log(
      `[SDK] baseFee for ${srcChain} to ${
        destChains[i]
      }: ${ethers.utils.formatEther(sdkFees[i].baseFee)} ETH`
    );
    console.log(
      `[API] baseFee for ${srcChain} to ${
        destChains[i]
      }: ${ethers.utils.formatEther(apiFees[i].baseFee)} ETH`
    );
    // console.log(
    //   `executionFee for ${srcChain} to ${
    //     destChains[i]
    //   }: ${ethers.utils.formatEther(sdkFees[i].executionFee)} ETH`
    // );
    // console.log(
    //   `l1ExecutionFee for ${srcChain} to ${
    //     destChains[i]
    //   }: ${ethers.utils.formatEther(sdkFees[i].l1ExecutionFee)} ETH`
    // );

    const totalExecutionFee = ethers.BigNumber.from(
      sdkFees[i].executionFee
    ).add(sdkFees[i].l1ExecutionFee);
    console.log(
      `[SDK] totalExecutionFee for ${srcChain} to ${
        destChains[i]
      }: ${ethers.utils.formatEther(totalExecutionFee)} ETH`
    );
    console.log(
      `[API] totalExecutionFee for ${srcChain} to ${
        destChains[i]
      }: ${ethers.utils.formatEther(apiFees[i].totalFee)} ETH`
    );
    if (actualExecutionFeesByDestChain[destChains[i]]) {
      const actualExecutionFee = ethers.BigNumber.from(
        actualExecutionFeesByDestChain[destChains[i]]
      );

      console.log(
        `actualExecutionFee for ${srcChain} to ${
          destChains[i]
        }: ${ethers.utils.formatEther(actualExecutionFee)} ETH`
      );

      console.log(
        `Diff SDK Execution Fee vs Actual Execution Fee for ${
          destChains[i]
        }: ${calculateDiffPercentage(
          actualExecutionFee,
          totalExecutionFee
        )} % (${
          actualExecutionFee.lt(totalExecutionFee)
            ? "SDK is more expensive"
            : "SDK is cheaper"
        })`
      );
    }
  }
}
