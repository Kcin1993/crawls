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
 * Citiesocial 熱銷前 100 名
 * 品牌名稱
 * 產品名稱
 * 價格
 * 品牌連結
 */
const pageUrl = "https://www.citiesocial.com/collections/top-100-best-selling";
const pageRequest = () => {
  let headers = [
    ["品牌名稱", "產品名稱", "原價", "售價", "產品連結", "品牌連結"]
  ];
  let data = [];
  axios.get(pageUrl).then(response => {
    let $ = cheerio.load(response.data);
    $(".product-item__info").each((i, item) => {
      let brandName = $(item)
        .children(".product-item__vendor")
        .children("a")
        .text();
      let productName = $(item)
        .children(".product-item__title")
        .children("a")
        .text();
      let oldPrice = $(item)
        .children(".product-item__price--old")
        .children("span")
        .text();
      let newPrice = $(item)
        .children(".product-item__price--new")
        .children("span")
        .text();
      let productLink = `https://www.citiesocial.com${$(item)
        .children(".product-item__title")
        .children("a")
        .attr("href")}`;
      let brandLink = `https://www.citiesocial.com${$(item)
        .children(".product-item__vendor")
        .children("a")
        .attr("href")}`;
      let d = [
        undefinedHandler(brandName),
        undefinedHandler(productName),
        undefinedHandler(oldPrice),
        undefinedHandler(newPrice),
        undefinedHandler(productLink),
        undefinedHandler(brandLink)
      ];
      data.push(d);
    });
    const csv = headers.concat(data);
    download(csv, `${new Date().getTime()}-file`);
  });
};

pageRequest();
