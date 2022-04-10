const fs = require("fs");

const pathToDir = "../data";
const destinationFile = "./item_names.json";

// 1. get all file names from /data
const fileNames = fs.readdirSync(pathToDir);

let finalArray = [];

fileNames.forEach((file) => {
  const fileData = fs.readFileSync(pathToDir + "/" + file, "utf-8"); // ../data/Axes.json

  let parsedItems;
  try {
    parsedItems = JSON.parse(fileData);
  } catch (error) {
    console.log(error);
  }

  const itemNames = parsedItems.map((data) => {
    return data[" Name "];
  });

  finalArray = finalArray.concat(itemNames);
});

const sanitizeSpaces = (str) => {
  if (str.startsWith(" ")) {
    str = str.replace(" ", "");
  }

  if (str.endsWith(" ")) {
    str = str.slice(0, -1);
  }

  str = str.replaceAll(" ", "");

  return str;
};

const sanitizedArray = finalArray.filter(Boolean).map(sanitizeSpaces);

console.log(sanitizedArray);

fs.writeFileSync(destinationFile, JSON.stringify(sanitizedArray));
