const express = require("express");
const routes = express.Router();
const validUrl = require("valid-url");
const axios = require("axios");
const util = require("../utilities/util");

require("dotenv").config();

routes.get("/", async (req, res, next) => {
  try {
    res.json("Ping Successful").status(200);
  } catch (error) {
    next(error);
  }
});

routes.get("/scrap", async (req, res, next) => {
  try {
    const URL = util.shortentURL(req.query.url);
    if (
      validUrl.isUri(URL) &&
      validUrl.isWebUri(URL) &&
      validUrl.isHttpsUri(URL)
    ) {
      try {
        let domain = URL.replace(/.+\/\/|www.|\..+/g, "");
        if (domain != null || domain != undefined || domain != "") {
          domain = domain.toUpperCase();
        } else {
          let err = new Error();
          err.message = "The url/link provided is invalid";
          err.status = 403;
          throw err;
        }

        let data = {};
        switch (domain) {
          case "AMAZON":
          case "FLIPKART":
            const [response, priceHistory] = await Promise.all([
              axios.get(`${process.env.PROD_DOMAIN}/getDetails?url=${URL}`),
              axios.get(
                `${process.env.PROD_DOMAIN}/getPriceHistory?url=${URL}`
              ),
            ]);
            data.data = response.data;
            data.priceHistory = priceHistory.data.data;
            break;
          default:
            break;
        }
        res.send({ response: data }).status(200);
      } catch (error) {
        next(error);
      }
    } else {
      let err = new Error();
      err.message = "The url/link provided is invalid";
      err.status = 403;
      throw err;
    }
  } catch (e) {
    next(e);
  }
});

routes.get(`/${process.env.ORCH_ROUTE}`, async (req, res, next) => {
  try {
    if (req.query.key == process.env.ORCH_KEY) {
      let data = await axios.get(
        `${process.env.AUTH_DOMAIN}/${process.env.USERS_ROUTE}?key=${process.env.KEY}`
      );
      res.send({ data: data.data.data }).status(200);
    } else {
      res.send({ data: "Access Denied" }).status(403);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
