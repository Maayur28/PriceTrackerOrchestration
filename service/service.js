let service = {};
const axios = require("axios");
const util = require("../utilities/util");

service.getTracker = async (body, page, limit, sortBy, filter) => {
  let productList = null;
  productList = await axios.post(
    `${process.env.AUTH_DOMAIN}/gettracker`,
    body,
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
  return await util.contructTrackerResponse(
    productList,
    page,
    limit,
    sortBy,
    filter
  );
};

service.updateTracker = async (body, page, limit, sortBy, filter) => {
  let productList = null;
  productList = await axios.put(
    `${process.env.AUTH_DOMAIN}/updatetracker`,
    body,
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
  return await util.contructTrackerResponse(
    productList,
    page,
    limit,
    sortBy,
    filter
  );
};

service.deleteTracker = async (body, page, limit, sortBy, filter) => {
  let productList = null;
  productList = await axios.put(
    `${process.env.AUTH_DOMAIN}/deletetracker`,
    body,
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
  return await util.contructTrackerResponse(
    productList,
    page,
    limit,
    sortBy,
    filter
  );
};
module.exports = service;
