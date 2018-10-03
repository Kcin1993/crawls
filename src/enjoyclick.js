/**
 * Packages
 */
const axios = require("axios");
const cheerio = require("cheerio");
const util = require("util");

/**
 * Setting
 */
const enjoyclickURL = "https://www.enjoyclick.com.tw/";

/**
 * 取得首頁上的標籤揪團
 */
const getLabelGroups = () => {
  return new Promise((resolve, reject) => {
    let labelGroup = [];
    axios
      .get(enjoyclickURL)
      .then(response => {
        let htmlContent = response.data;
        let $ = cheerio.load(htmlContent);
        let arr = []; //暫存標籤揪團網址
        $(".more-link").each((i, element) => {
          let labelGroupLink = element.attribs.href;
          arr[i] = labelGroupLink;
        });
        return arr;
      })
      .then(response => {
        labelGroup = response;
        resolve(labelGroup);
      });
  });
};

/**
 * 取得首頁產品中的：產品資訊s / 團主資訊 / 揪團網址s / 揪團資訊
 */
const getKOLs = () => {
  return new Promise((kolsResolve, reject) => {
    //查詢首頁中的所有 KOL 網址
    axios.get(enjoyclickURL).then(response => {
      let htmlContent = response.data;
      let $ = cheerio.load(htmlContent);
      let arr = []; //暫存 KOL 網址
      $(".item-group-buying") //選取產品卡片
        .children("a") //卡片下一層的 a 標籤
        .each((i, element) => {
          let kolLink = `https://www.enjoyclick.com.tw/${element.attribs.href}`;
          arr[i] = kolLink;
        });
      //查詢某個 KOL 細節
      const kolDetail = url => {
        return new Promise((resolve, reject) => {
          axios.get(url).then(response => {
            let kolHtmlContent = response.data;
            let $ = cheerio.load(kolHtmlContent);
            //取得該 KOL 的名字
            let name = $(".group-header")
              .children(".col-lg-18")
              .children("h1")
              .text();
            let groupLink = url;
            //取得該 KOL 相關的連結
            let kolLinks = () => {
              let obj = {};
              $(".clicker-link")
                .children(".col")
                .children("a")
                .each((i, element) => {
                  let relativeLink = element.attribs.href;
                  obj[`kolLink_${i + 1}`] = relativeLink;
                });
              return obj;
            };
            //取得該 KOL 相關的產品資訊
            let products = () => {
              let obj = {};
              //標題
              $(".card").each((i, element) => {
                let title = $(element)
                  .children(".card-body")
                  .children(".card-title")
                  .text();
                let originPrice = $(element)
                  .children(".card-body")
                  .children(".price")
                  .children(".text-right")
                  .children("del")
                  .text();
                let price = $(element)
                  .children(".card-body")
                  .children(".price")
                  .children(".text-primary")
                  .text();
                obj[
                  `proudct_${i + 1}`
                ] = `產品名稱:${title} / 原價:${originPrice} / 售價：${price}`;
              });
              return obj;
            };
            resolve({
              name,
              groupLink,
              kolLinks: kolLinks(),
              lengthOfProduct: `${Object.keys(products()).length}件產品`,
              products: products()
            });
          });
        });
      };
      //合併每個 KOL 細節的查詢
      const kolsDetail = () => {
        // let promiseArray = [kolDetail(arr[0])];
        let promiseArray = [];
        for (x = 0; x < arr.length; x++) {
          promiseArray.push(kolDetail(arr[x]));
        }
        return Promise.all(promiseArray);
      };
      //每個 KOL 細節
      kolsDetail().then(res => {
        kolsResolve(res);
      });
    });
  });
};

/**
 * 合併標籤揪團 與 KOLS 詳細資料 的請求
 */
const combine = () => {
  const promiseArray = [getLabelGroups(), getKOLs()];
  return Promise.all(promiseArray);
};

const result = () => {
  combine().then(res => {
    let data = {
      labelGroups: res[0],
      kols: res[1]
    };
    data = util.inspect(data, false, null);
    console.log(`[Console] --${new Date()}-- Data`, data);
    return data;
  });
};

result();
