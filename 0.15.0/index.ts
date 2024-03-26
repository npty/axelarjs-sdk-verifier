import runEstimateGasFeeTest from "./testEstimateGasFee";
import runManualRelayToDestChain from "./testManualRelayToDestChain";

(async () => {
  for (let i = 0; i < 10; i++) {
    console.log(
      "\n\n ### Test round:",
      i + 1,
      `${new Date().toLocaleTimeString()} ###`
    );
    const destChains = ["fraxtal", "blast"];
    await runEstimateGasFeeTest(destChains);

    // wait 60s
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
  // await runManualRelayToDestChain();
})();
