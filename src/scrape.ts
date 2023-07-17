// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset, Configuration } from "crawlee";
const config = Configuration.getGlobalConfig();
config.set("purgeOnStart", false);
interface GumtreeListing {
  title: string;
  price: string;
  adDate: Date;
  itemUrl: string;
}

interface GumtreePage {
  count: number;
  pageUrl: string;
  results: GumtreeListing[];
}

let count = 1;
const daysOldLimit = 30;
const paginationLimit = 32;

function stripAdAge(text: string): string {
  const strippedText = text.replace("Ad posted", "").replace("ago", "").trim();
  return strippedText;
}

function terminateFromTitle(title: string): boolean {
  const pattern = /Page (\d+)\/(\d+)/;
  const matches = pattern.exec(title);

  if (matches) {
    const first_number = matches[1];
    const second_number = matches[2];
    console.log(first_number, second_number);
    return first_number === second_number;
  } else {
    return false;
  }
}

function parseAdDate(text: string): Date {
  const strippedText = stripAdAge(text);
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (!strippedText.includes("days")) return date;

  const daysAdPosted = Number(strippedText.split(" ")[0]);
  date.setDate(date.getDate() - daysAdPosted);
  return date;
}

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, log, saveSnapshot }) {
    const pageTitle = await page.title();
    log.info(`Title of ${request.loadedUrl} is '${pageTitle}'`);

    const results: GumtreeListing[] = [];
    let areFreshResults = false;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysOldLimit);

    const naturalresults = await page.$('[data-q="naturalresults"]');
    if (naturalresults === null) {
      log.info("No results found on page");
      return;
    }
    const listings = await naturalresults.$$(".listing-link");
    for (const listing of listings) {
      const link = await listing.getAttribute("href");
      const title = await listing.$eval(
        ".listing-title",
        (element) => element.textContent
      );
      const price = await listing.$eval(
        ".listing-price",
        (element) => element.textContent
      );
      if (title === null || price === null || link === null) {
        log.warning("Skipping null item:", { title, price, link });
        continue;
      }

      const adAgeText =
        (await listing.$eval(
          '[data-q="listing-adAge"]',
          (element) => element.textContent
        )) || "0";

      const adDate = parseAdDate(adAgeText);
      if (adDate > dateLimit) areFreshResults = true;
      results.push({ title, price, adDate, itemUrl: link });
    }
    const pageResults: GumtreePage = {
      count,
      pageUrl: request.url,
      results,
    };
    await Dataset.pushData(pageResults);

    if (terminateFromTitle(pageTitle)) {
      log.info("Terminating as the last page was reached.");
      return;
    }
    if (!areFreshResults) {
      log.info("Terminating as the results are too old.");
      return;
    }
    if (count >= paginationLimit) {
      log.info("Terminating as the pagination limit was reached.");
      return;
    }
    count++;
    const nextUrl = `https://www.gumtree.com/search?search_category=video-cards-sound-cards&search_location=uk&page=${count}`;
    await crawler.addRequests([nextUrl]);
  },
  // Uncomment this option to see the browser window.
  // headless: false,
});

// Add first URL to the queue and start the crawl.
await crawler.run([
  "https://www.gumtree.com/search?search_category=video-cards-sound-cards&search_location=uk&page=1",
]);
