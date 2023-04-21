const axios = require("axios");
let util = {};
util.shortentURL = (URL) => {
  let domain = URL.replace(/.+\/\/|www.|\..+/g, "");
  if (domain != null || domain != undefined || domain != "") {
    domain = domain.toUpperCase();
  }
  switch (domain) {
    case "AMAZON":
      URL = util.shortenAmazonURL(URL);
      break;
    case "FLIPKART":
      URL = URL = util.shortenFlipkartURL(URL);
      break;
    default:
      break;
  }
  return URL;
};

util.shortenAmazonURL = (URL) => {
  if (URL.includes("/ref=")) {
    URL = URL.split("/ref=")[0];
  }
  if (URL.includes("?pd_rd_w=")) {
    URL = URL.split("?pd_rd_w=")[0];
  }
  return URL;
};

util.shortenFlipkartURL = (URL) => {
  if (URL.includes("?pid=")) {
    URL = URL.split("?pid=")[0];
  }
  return URL;
};

util.getUrlsList = (products) => {
  let urlList = [];
  products.forEach((element) => {
    urlList.push(element.url);
  });
  let urls = {
    urls: urlList,
  };
  return urls;
};

const filterData = (obj, filter) => {
  if (
    filter == null ||
    filter == undefined ||
    Object.keys(filter).length < 4 ||
    Object.keys(filter).length > 4
  ) {
    return true;
  } else {
    if (
      filter["company"] == "" ||
      obj.domain.toLowerCase().includes(filter["company"])
    ) {
      if (
        filter["curPrice"][0] == 0 ||
        filter["curPrice"][1] == 0 ||
        (parseInt(filter["curPrice"][0]) <= parseInt(obj.currentPrice) &&
          parseInt(filter["curPrice"][1]) >= parseInt(obj.currentPrice))
      ) {
        if (
          filter["priceDropped"] == "" ||
          filter["priceDropped"] == "false" ||
          (filter["priceDropped"] == true && obj.priceDrop > 0)
        ) {
          if (
            filter["search"] == "" ||
            filter["search"].trim() == "" ||
            validateSearchFilter(filter["search"], obj)
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};

const validateSearchFilter = (filter, obj) => {
  filter = filter.toLowerCase();
  if (
    obj.title.toLowerCase().includes(filter) ||
    obj.domain.toLowerCase().includes(filter) ||
    obj.price.discountPrice.toLowerCase().includes(filter) ||
    obj.price.originalPrice.toLowerCase().includes(filter) ||
    obj.rating.ratingCount.toLowerCase().includes(filter) ||
    obj.rating.totalRated.toLowerCase().includes(filter) ||
    obj.alertPrice == filter ||
    obj.minimumPrice == filter ||
    obj.currentPrice == filter ||
    obj.maximumPrice == filter
  ) {
    return true;
  } else return false;
};

const sortData = (productData, value) => {
  if (value === "Relevance") {
    return productData;
  } else if (
    productData != null &&
    productData !== undefined &&
    productData.length > 1
  ) {
    if (value === "CurPrice:L2H") {
      productData.sort((a, b) => a.currentPrice - b.currentPrice);
      return productData;
    } else if (value === "CurPrice:H2L") {
      productData.sort((a, b) => b.currentPrice - a.currentPrice);
      return productData;
    } else if (value === "MPD") {
      productData.sort((a, b) => b.priceDrop - a.priceDrop);
      return productData;
    } else return productData;
  } else {
    return productData;
  }
};

const doPagination = (productData, page, limit) => {
  let start = (parseInt(page) - 1) * parseInt(limit);
  let end = parseInt(limit) + parseInt(start);
  if (
    productData != null &&
    productData != undefined &&
    productData.length > 1
  ) {
    productData = productData.slice(start, end);
  }
  return productData;
};

const contructResponse = (
  productList,
  priceHistory,
  page,
  limit,
  sortBy,
  filterQuery
) => {
  let trackerResponse = {};
  let productData = [];
  let currentPage = 0;
  let currentLimit = 0;
  let count = 0;
  let totalCount = 0;
  let filterCount = 0;
  let filterPrice = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  if (
    productList != null &&
    productList != undefined &&
    productList.length > 0 &&
    priceHistory != null &&
    priceHistory != undefined &&
    priceHistory.length > 0 &&
    page != null &&
    page != undefined &&
    sortBy != null &&
    sortBy != undefined &&
    limit != null &&
    limit != undefined
  ) {
    currentPage = parseInt(page);
    currentLimit = parseInt(limit);
    totalCount = parseInt(productList.length);
    productList.forEach((data) => {
      let obj = data;
      delete obj["emailSentPrice"];
      delete obj["badge"];
      delete obj["_id"];
      if (priceHistory.find((x) => data.url.includes(x.url))) {
        obj.minimumPrice = priceHistory.find((x) =>
          data.url.includes(x.url)
        ).minimumPrice;
        obj.currentPrice = priceHistory.find((x) =>
          data.url.includes(x.url)
        ).currentPrice;
        obj.maximumPrice = priceHistory.find((x) =>
          data.url.includes(x.url)
        ).maximumPrice;
        obj.priceDrop = obj.price.discountPrice - obj.currentPrice;
        if (filterPrice[0] > obj.currentPrice) {
          filterPrice[0] = obj.currentPrice;
        }
        if (filterPrice[1] < obj.currentPrice) {
          filterPrice[1] = obj.currentPrice;
        }
      }
      productData.push(obj);
    });
    productData = productData.filter((obj) => filterData(obj, filterQuery));
    productData = sortData(productData, sortBy);
    filterCount = parseInt(productData.length);
    productData = doPagination(productData, page, limit);
    count = parseInt(productData.length);
  }
  trackerResponse.page = currentPage;
  trackerResponse.limit = currentLimit;
  trackerResponse.count = count;
  trackerResponse.filterCount = filterCount;
  trackerResponse.totalCount = totalCount;
  trackerResponse.sortBy = sortBy;
  if (filterQuery["curPrice"][0] == 0 || filterQuery["curPrice"][1] == 0) {
    filterQuery["curPrice"] = filterPrice;
  } else {
    trackerResponse.filterQuery = filterQuery;
  }
  trackerResponse.filterPrice = filterPrice;
  trackerResponse.filterQuery = filterQuery;
  trackerResponse.data = productData;
  return trackerResponse;
};

util.contructTrackerResponse = async (
  productList,
  page,
  limit,
  sortBy,
  filter
) => {
  let priceHistory = null,
    trackerResponse = null;
  if (
    productList != null &&
    productList.status == 200 &&
    productList.data != null &&
    productList.data !== undefined &&
    productList.data.data != null &&
    productList.data.data !== undefined &&
    productList.data.data.products != null &&
    productList.data.data.products !== undefined &&
    productList.data.data.products.length > 0
  ) {
    productList = productList.data.data.products;
    urlList = util.getUrlsList(productList);
    const urlsResponse = await axios.post(
      `${process.env.PROD_DOMAIN}/getPriceHistoryUrls`,
      urlList,
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    if (
      urlsResponse.status === 200 &&
      urlsResponse.data != null &&
      urlsResponse.data !== undefined &&
      urlsResponse.data !== "" &&
      urlsResponse.data.data != null &&
      urlsResponse.data.data !== undefined
    ) {
      priceHistory = urlsResponse.data.data;
    }
    trackerResponse = contructResponse(
      productList,
      priceHistory,
      page,
      limit,
      sortBy,
      filter
    );
  }
  return trackerResponse;
};

module.exports = util;
