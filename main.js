const fs = require("fs");
const axios = require("axios");
const jsdom = require("jsdom");

const items = require("./item_names.json");

const { JSDOM } = jsdom;

const SCRAPING_BASE_URL = "https://eldenring.wiki.fextralife.com";

const results = [];

function fetch(url) {
  return axios({ method: "get", url });
}

function parseBasicItemInfo(table) {
  return {
    name: table.querySelector("h2").textContent,
    image: table.querySelector("img").src,
    category: table.querySelectorAll("a")[10].textContent,
  };
}

function parseLocation(element) {
  const h3s = element.querySelectorAll("h3");

  const targetH3 = Array.from(h3s).find((el) => {
    const txt = el.textContent?.toUpperCase();

    return (
      txt.includes("WHERE TO") ||
      txt.includes("IN ELDEN RING") ||
      txt.includes("FIND")
    );
  });

  let nextElementSibling = targetH3?.nextElementSibling;

  while (
    nextElementSibling?.tagName !== "UL" &&
    nextElementSibling?.nextElementSibling
  ) {
    nextElementSibling = nextElementSibling.nextElementSibling;
  }

  return Array.from(nextElementSibling?.children)?.map((child) => {
    return child?.textContent.replaceAll(/\s\s+/g, " ");
  });
}

function getTableData({ table, document }) {
  const basicInfo = parseBasicItemInfo(table);
  const location = parseLocation(document);

  return { ...basicInfo, location, tracked: false, collected: false };
}

function run(items, baseUrl = SCRAPING_BASE_URL) {
  console.log("executing run with: ", items);

  return Promise.all(
    items.map((item) => {
      const URL = encodeURI(baseUrl + "/" + item);
      console.log(URL);
      return fetch(URL).then((res) => {
        const dom = new JSDOM(res.data);
        const { document } = dom.window;
        const table = document.querySelector("table.wiki_table");

        results.push(getTableData({ table, document }));
      });
    })
  );
}

const batchProcess = async (task, args, maxParallelTasks = 20) => {
  for (let i = 0; i < args.length; i += maxParallelTasks) {
    const argsSubset = args.slice(i, i + maxParallelTasks);
    await task(argsSubset);
  }
};

(async () => {
  await batchProcess(run, items);
  fs.writeFileSync(
    `./data/database.json`,
    JSON.stringify(results, null, 4),
    "utf-8"
  );
})();
