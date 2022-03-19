const fs = require("fs");
const axios = require("axios");
const jsdom = require("jsdom");

const endpoints = require("./table_endpoints.json");

const { JSDOM } = jsdom;

const SCRAPING_BASE_URL = "https://eldenring.wiki.fextralife.com";

function fetch(url) {
  return axios({ method: "get", url });
}

function getTableRows(table) {
  const rows = Array.from(table.querySelectorAll("tr"));
  const properties = parseValuesFromRow(rows[0]);
  const valueMap = rows.slice(1, rows.length - 1).map(parseValuesFromRow);

  const parsedTable = [];

  valueMap.forEach((values) => {
    const entry = {};
    properties.forEach((property, idx) => {
      entry[property] = values[idx];
    });
    parsedTable.push(entry);
  });

  return parsedTable;
}

function parseValuesFromRow(row) {
  return Array.from(row.children).map((child) => {
    return child.textContent;
  });
}

function run(baseUrl, endpoints) {
  endpoints.forEach((endpoint) => {
    fetch(baseUrl + "/" + endpoint).then((res) => {
      const dom = new JSDOM(res.data);
      const { document } = dom.window;
      const magicSpellsTable = document.querySelector(
        ".wiki_table.sortable.searchable"
      );
      const results = getTableRows(magicSpellsTable);

      fs.writeFileSync(
        `./data/${endpoint}.json`,
        JSON.stringify(results, null, 4),
        "utf-8"
      );
    });
  });
}

run(SCRAPING_BASE_URL, endpoints);
