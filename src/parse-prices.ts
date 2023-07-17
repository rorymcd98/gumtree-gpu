import * as fs from "fs";

interface GPU {
  title: string;
  price: string;
  itemUrl: string;
}
interface FormatGPU {
  title: string;
  price: number;
  itemUrl: string;
}

interface GPUData {
  count: number;
  pageUrl: string;
  results: GPU[];
}

const poundStringToInt = (poundString: string): number => {
  return Number(poundString.replace("£", ""));
};

const formatGpu = (gpu: GPU): FormatGPU => {
  const newGpu = {
    price: poundStringToInt(gpu.price),
    title: gpu.title.replace(/\r?\n|\r/g, ""),
    itemUrl: (gpu.itemUrl = "https://gumtree.com/" + gpu.itemUrl),
  };

  return newGpu;
};

export interface CategorisedGpus {
  [key: string]: FormatGPU[];
}
export async function categoriseGPUs(
  jsonPath: string,
  gpuCategories: string[]
): Promise<CategorisedGpus> {
  const categorisedGpus: Record<string, FormatGPU[]> = {};
  try {
    const filenames = fs.readdirSync(jsonPath);

    for (const file of filenames) {
      const filePath = `${jsonPath}/${file}`;
      const jsonData = fs.readFileSync(filePath, "utf-8");
      const gpuData: GPUData = JSON.parse(jsonData);

      for (const gpuName of gpuCategories) {
        if (gpuCategories.includes(gpuName)) {
          gpuData.results.forEach((gpu) => {
            if (gpu.title.includes(gpuName)) {
              if (!categorisedGpus[gpuName]) {
                categorisedGpus[gpuName] = [];
              }
              const formattedGpu = formatGpu(gpu);
              categorisedGpus[gpuName].push(formattedGpu);
            }
          });
        }
      }
    }
  } catch (err) {
    console.error("An error occurred while reading the GPU data:", err);
  }
  return categorisedGpus;
}

export function getLowestPrice(categorisedGpu: GPU[]) {
  let lowestPrice = Number.MAX_SAFE_INTEGER;
  let lowestPriceGpu: GPU | undefined = undefined;

  categorisedGpu.forEach((gpu) => {
    const price = poundStringToInt(gpu.price);
    if (price < lowestPrice) {
      lowestPrice = price;
      lowestPriceGpu = gpu;
    }
  });

  return lowestPriceGpu;
}

// getLowestGPUPrices(jsonPath, gpuNames)
//   .then((prices) => {
//     console.log(prices);
//   })
//   .catch((err) => {
//     console.error(
//       "An error occurred while fetching the lowest GPU prices:",
//       err
//     );
//   });
