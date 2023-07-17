import { categoriseGPUs } from "./parse-prices";
import { createUI } from "./blessed-interface";
const jsonPath = "./storage/datasets/default";
const gpuNames = Array.from(
  new Set([
    "titan",
    "2080",
    "3060",
    "3060",
    "3070",
    "3080",
    "3080",
    "3080",
    "3090",
    "4070",
    "4080",
    "4090",
    "6700",
    "6700",
    "6750",
    "6800",
    "6800",
    "6900",
    "6950",
    "7900",
    "7900",
  ])
);
(async () => {
  const categorisedGpus = await categoriseGPUs(jsonPath, gpuNames);
  await createUI(categorisedGpus);
})();
