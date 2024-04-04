import runEstimateGasFeeTest from "./testEstimateGasFee";
import runEstimateOsmosisTest from "./testOsmosisGas";
import runManualRelayToDestChain from "./testManualRelayToDestChain";

(async () => {
  await runEstimateGasFeeTest("ethereum");
  // await runManualRelayToDestChain();
})();
