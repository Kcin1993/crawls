/**
 * Packages
 */
const axios = require("axios");
const cheerio = require("cheerio");
const R = require("ramda");

/**
 * Setting
 */
const zecUrl = page => `https://www.zeczec.com/?page=${page}`;
const pageLength = 7;

/**
 * Get website data
 */
let paegRequestpromise = page => {
  return new Promise((resolve, reject) => {
    axios
      .get(zecUrl(page))
      .then(response => {
        let htmtContent = response.data;
        let $ = cheerio.load(htmtContent);
        let pageAmounstArray = [];
        $(".fr.b").each(function(i, elem) {
          if (R.lt(i, 12)) {
            //只選擇前12比，一次性計畫
            let trimText = $(this)
              .text()
              .replace(/\,/g, "") //除除逗號
              .replace(/\$/g, "") //移除錢字號
              .replace(/\\n/g, ""); //移除換行符號 /n
            pageAmounstArray[i] = Number(trimText);
          }
        });
        let pageSumAmount = R.reduce(R.add, 0, pageAmounstArray);
        let pageData = {
          pageAmounstArray,
          pageSumAmount,
          page
        };
        resolve(pageData);
      })
      .catch(err => reject(err));
  });
};

const getPageProduct = () => {
  let requestsArray = [];
  for (var x = 0; x < pageLength; x++) {
    requestsArray.push(paegRequestpromise(x + 1));
  }
  return Promise.all(requestsArray);
};

getPageProduct()
  .then(response => {
    let zecStatistic = {
      pages: {},
      allPagesSumAmount: 0
    };
    let dataLength = response.length;
    for (var x = 0; x < dataLength; x++) {
      zecStatistic.pages[x + 1] = response[x]; //寫入每頁資料
      zecStatistic.allPagesSumAmount += response[x].pageSumAmount; //加總每頁的總金額
    }
    console.log(zecStatistic);
    return zecStatistic;
  })
  .catch(err => {
    console.log(`[Console] --${new Date()}-- promise all error`, err);
  });
