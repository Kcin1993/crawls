/**
 * Packages
 */
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const csv = require("fast-csv");

/**
 * helper func
 */
const download = (data, fileName) =>
  csv
    .write(data, { headers: true })
    .pipe(fs.createWriteStream(`${fileName}.csv`));

const undefinedHandler = value => (value ? value : "數值不存在");

/**
 * 美妝教主部落客清單
 * 每頁一個 request
 */
const pageUrl = page => `https://www.beautyblog.com.tw/blog/list/page/${page}`;
const pages = ["1", "2", "3", "4"];

const pageRequest = page => {
  return new Promise((resolve, reject) => {
    let pageValues = [];
    axios
      .get(pageUrl(page))
      .then(response => {
        let $ = cheerio.load(response.data);
        $(".BloggerListHot")
          .children("li")
          .each((i, item) => {
            let name = $(item)
              .children(".BloggerInfo")
              .children("h3")
              .children("a")
              .text();
            pageValues.push(undefinedHandler(name));
          });
        resolve(pageValues);
      })
      .catch(err => {
        reject("page request with error", err);
      });
  });
};

const combineRequest = () => {
  const requestArray = [];
  for (var x = 0; x < pages.length; x++) {
    requestArray.push(pageRequest(pages[x]));
  }
  let headers = [["名稱"]];
  let data = [];
  Promise.all(requestArray)
    .then(response => {
      for (var y = 0; y < response.length; y++) {
        for (var v = 0; v < response[y].length; v++) {
          data.push([response[y][v]]);
        }
      }
      const csv = headers.concat(data);
      download(csv, `${new Date().getTime()}-file`);
    })
    .catch(err => {
      console.log(err);
    });
};

combineRequest();
