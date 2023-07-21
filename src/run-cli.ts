import { categoriseGPUs } from "./parse-prices";
import { createUI } from "./interface";

const gpuJsonPath = "./storage/datasets/default/";
const hardwareJsonPath = "./storage/datasets/hardware/";
const laptopJsonPath = "./storage/datasets/laptop/";

(async () => {
  const categorisedGpus = await categoriseGPUs(laptopJsonPath);
  await createUI(categorisedGpus);
})();
