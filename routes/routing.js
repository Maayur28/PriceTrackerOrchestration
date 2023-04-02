const express = require("express");
const routes = express.Router();
const validUrl = require("valid-url");
const linkCheck = require("link-check");
const axios = require("axios");
const service = require("../service/service");

require("dotenv").config();

routes.get("/", async (req, res, next) => {
  try {
    const URL = req.query.url;
    if (
      validUrl.isUri(URL) &&
      validUrl.isWebUri(URL) &&
      validUrl.isHttpsUri(URL)
    ) {
      linkCheck(URL, async function (err, result) {
        try {
          if (err) {
            let err = new Error();
            err.message = "The url/link provided is not available";
            err.status = 404;
            throw err;
          }
          if (result.status == "alive") {
            let domain = URL.replace(/.+\/\/|www.|\..+/g, "");
            if (domain != null || domain != undefined || domain != "") {
              domain = domain.toUpperCase();
            } else {
              let err = new Error();
              err.message = "The url/link provided is invalid";
              err.status = 403;
              throw err;
            }

            let response = null;
            switch (domain) {
              case "AMAZON":
              case "MYNTRA":
                response = await axios.get(
                  `${process.env.PROD_DOMAIN}?url=${URL}`
                );
                break;
              default:
                break;
            }
            res.send(response.data).status(200);
          } else {
            let err = new Error();
            err.message = "The url/link provided is dead";
            err.status = 400;
            throw err;
          }
        } catch (error) {
          next(error);
        }
      });
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
