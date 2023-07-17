import blessed from "blessed";
import { type CategorisedGpus } from "./parse-prices";
import opn from "opn";

export async function createUI(categorisedGpus: CategorisedGpus) {
  const screen = blessed.screen({
    smartCSR: true,
    title: "GPU Price Tracker",
  });

  const categoryList = blessed.list({
    parent: screen,
    left: 0,
    top: 0,
    width: "30%",
    height: "100%",
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "blue",
      selected: {
        fg: "black",
        bg: "white",
      },
    },
    interactive: true,
    items: Object.keys(categorisedGpus),
  });
  categoryList.focus();

  const gpuPostings = blessed.list({
    parent: screen,
    left: "30%",
    top: 0,
    width: "70%",
    height: "100%",
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "blue",
      selected: {
        fg: "black",
        bg: "white",
      },
    },
    interactive: true,
    items: Object.values(categorisedGpus)[0].map((gpu) => gpu.title),
  });

  function makeNavigationSwitch(
    list: blessed.Widgets.ListElement,
    isCategoryList = false,
    indeces = { category: 0, gpu: 0 }
  ) {
    return (key: any) => {
      let index = isCategoryList ? indeces.category : indeces.gpu;
      switch (key.name) {
        case "up":
          list.up(1);
          index = Math.max(index - 1, 0);
          break;
        case "down":
          list.down(1);
          index = Math.min(index + 1, Object.keys(categorisedGpus).length - 1);
          break;
        case "right":
          gpuPostings.focus();
          break;
        case "left":
          categoryList.focus();
          if (!isCategoryList) {
            index = 0;
            gpuPostings.select(0);
          }
          break;
        case "enter":
          if (!isCategoryList) {
            //Get the url and goto it
            const gpu =
              Object.values(categorisedGpus)[indeces.category][indeces.gpu];
            const url = gpu.itemUrl;
            opn(url);
          }
          break;
        default:
          break;
      }
      if (isCategoryList) {
        let GPU = Object.values(categorisedGpus)[index];
        GPU = GPU.sort((gpuA, gpuB) => {
          return gpuA.price - gpuB.price;
        });
        const gpuList = GPU.map((gpu) => `£${gpu.price} \t ${gpu.title}`);
        gpuPostings.setItems(gpuList);
        indeces.category = index; // Update indeces.category
      } else {
        indeces.gpu = index; // Update indeces.gpu
      }
    };
  }

  const indeces = { category: 0, gpu: 0 };
  const categoryNavigationSwitch = makeNavigationSwitch(
    categoryList,
    true,
    indeces
  );
  const gpuNavigationSwitch = makeNavigationSwitch(gpuPostings, false, indeces);

  categoryList.on("select", (item, index) => {
    gpuPostings.setItems(["a"]);
    gpuPostings.focus();
  });

  categoryList.on("keypress", (ch, key) => {
    globalSwitch(key);
    categoryNavigationSwitch(key);
    screen.render();
  });

  gpuPostings.on("keypress", (ch, key) => {
    globalSwitch(key);
    gpuNavigationSwitch(key);
    screen.render();
  });

  function globalSwitch(key: any) {
    switch (key.name) {
      case "q":
        return process.exit(0);
    }
  }

  screen.render();
}
