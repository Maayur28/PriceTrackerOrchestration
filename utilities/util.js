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
    filter.trim() == "" ||
    filter.trim().length == 0
  ) {
    return true;
  } else {
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
  }
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

util.contructResponse = (
  productList,
  priceHistory,
  page,
  limit,
  sortBy,
  filterString
) => {
  let trackerResponse = {};
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
    trackerResponse.page = page;
    trackerResponse.limit = limit;
    let productData = [];
    let totalTrackers = productList.length;
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
        obj.priceDrop = obj.currentPrice - obj.price.discountPrice;
      }
      productData.push(obj);
    });
    productData = productData.filter((obj) => filterData(obj, filterString));
    productData = sortData(productData, sortBy);
    let totalCount = productData.length;
    productData = doPagination(productData, page, limit);
    trackerResponse.count = productData.length;
    trackerResponse.filterCount = totalCount;
    trackerResponse.totalCount = totalTrackers;
    trackerResponse.sortBy = sortBy;
    trackerResponse.filter = filterString;
    trackerResponse.data = productData;
  }
  return trackerResponse;
};

module.exports = util;
