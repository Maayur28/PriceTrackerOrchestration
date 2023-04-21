let service = {};
const axios = require("axios");
const util = require("../utilities/util");

service.getTracker = async (body, page, limit, sortBy, filter) => {
  let productList = null,
    priceHistory = null,
    trackerResponse = null;
  productList = await axios.post(
    `${process.env.AUTH_DOMAIN}/gettracker`,
    body,
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );

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
    trackerResponse = util.contructResponse(
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

module.exports = service;
