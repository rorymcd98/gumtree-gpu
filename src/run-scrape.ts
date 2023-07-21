import { Configuration } from "crawlee";
import { createCrawler } from "./scrape";
import fs from "fs";
const config = Configuration.getGlobalConfig();
config.set("purgeOnStart", false);
export const storageId = "laptop";
config.set("defaultDatasetId", storageId);
config.set("defaultKeyValueStoreId", storageId);
config.set("defaultRequestQueueId", storageId);

function purgeRequestQueueFolder() {
  const path = "./storage/request_queues/";
  const files = fs.readdirSync(path);
  for (const file of files) {
    fs.unlinkSync(path + file);
  }
}

export enum Categories {
  GENERAL = "https://www.gumtree.com/for-sale/computers-software/computers-pcs-laptops/memory-motherboards-processors/uk/page",
  GPU = "https://www.gumtree.com/search?search_category=video-cards-sound-cards&search_location=uk&page=",
  LAPTOP = "https://www.gumtree.com/for-sale/computers-software/computers-pcs-laptops/laptops/uk/page",
}

(async () => {
  const initialPage = 1;
  // purgeRequestQueueFolder();
  const url = Categories.LAPTOP;
  const crawler = createCrawler(35, 100, url);
  await crawler.run([url + initialPage]);
})();
