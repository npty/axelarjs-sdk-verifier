import runEstimateGasFeeTest from "./testEstimateGasFee";
import runManualRelayToDestChain from "./testManualRelayToDestChain";

(async () => {
  await runEstimateGasFeeTest();
  // await runManualRelayToDestChain();
})();
