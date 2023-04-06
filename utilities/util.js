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

  module.exports = util;