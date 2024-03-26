import {
  AxelarGMPRecoveryAPI,
  Environment,
} from "@axelar-network/axelarjs-sdk";

async function main() {
  const recovery = new AxelarGMPRecoveryAPI({
    environment: Environment.TESTNET,
  });

  const txHash =
    "0xc4f10e47d6e8561eaa2f27f16a048c897611ce6c77433a063b5618971056a591";
  const response = await recovery.manualRelayToDestChain(txHash);

  console.log(response);
}

export default main;
