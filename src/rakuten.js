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
 * 樂天市場店家一覽
 */
const pageUrl = "https://www.rakuten.com.tw/shop";
const pageRequest = () => {
  let headers = [["品牌名稱", "商城連結", "分類"]];
  let data = [];
  axios.get(pageUrl).then(response => {
    let $ = cheerio.load(response.data);
    $(".ui-shop-category").each((i, item) => {
      let cat = $(item)
        .children("h2")
        .children("a")
        .text();

      $(item)
        .children(".category-content")
        .children("ul")
        .children("li")
        .each((i, item) => {
          let brandName = $(item)
            .children("h3")
            .children("a")
            .text();
          let brandLink = $(item)
            .children("h3")
            .children("a")
            .attr("href");
          let d = [
            undefinedHandler(brandName),
            undefinedHandler(brandLink),
            undefinedHandler(cat)
          ];
          data.push(d);
        });
    });
    const csv = headers.concat(data);
    download(csv, `${new Date().getTime()}-file`);
  });
};

pageRequest();
