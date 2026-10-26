const express =
  require("express");

const validationMiddleware =
  require(
    "./middleware/validationMiddleware"
  );

const errorMiddleware =
  require(
    "./middleware/errorMiddleware"
  );

const listProductOrderBuyRoutes = require(
  "./APIs/listProductOrderBuy/routes/listProductOrderBuyRoutes"
);

const confirmPurchaseExtraRoutes = require(
  "./APIs/confirmPurchaseExtra/routes/confirmPurchaseExtraRoutes"
);

const orderBuyAdvReportsRoutes = require(
  "./APIs/orderBuyAdvReports/routes/orderBuyAdvReportsRoutes"
);

const orderUnsubscribeAdvRoutes = require(
  "./APIs/orderUnsubscribeAdv/routes/orderUnsubscribeAdvRoutes"
);

const orderDataGiftEnrollRoutes = require(
  "./APIs/orderDataGiftEnroll/routes/orderDataGiftEnrollRoutes"
);

const validateDataGiftRoutes = require(
  "./APIs/validateDataGift/routes/validateDataGiftRoutes"
);

const createApplicationRoutes = require(
  "./APIs/createApplication/routes/createApplicationRoutes"
);

const patchApplicationRoutes = require(
  "./APIs/patchApplication/routes/patchApplicationRoutes"
);

const orderPurchasedRoutes = require(
  "./APIs/orderPurchased/routes/orderPurchasedRoutes"
);

const generateApplicationRoutes = require(
  "./APIs/generateApplication/routes/generateApplicationRoutes"
);

const retrievePurchaseRoutes = require(
  "./APIs/retrievePurchase/routes/retrievePurchaseRoutes"
);

const app =
  express();


app.use(
  express.json()
);


app.get(
  "/health",
  (req, res) => {
    return res
      .status(200)
      .json({
        status: "UP",

        service:
          "product-ordering-service"
      });
  }
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/listProductOrderBuy",
  listProductOrderBuyRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/confirmPurchaseExtra",
  confirmPurchaseExtraRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderBuyAdvReports",
  orderBuyAdvReportsRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderUnsubscribeAdv",
  orderUnsubscribeAdvRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderDataGiftEnroll",
  orderDataGiftEnrollRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/validateDataGift",
  validateDataGiftRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/createApplication",
  createApplicationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/patchApplication",
  patchApplicationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderPurchased",
  orderPurchasedRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/generateApplication",
  generateApplicationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/retrievePurchase",
  retrievePurchaseRoutes
);

/*
 * 404 handler
 */

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        code: "404",

        reason:
          "Not Found",

        message:
          `Route not found: ${req.method} ${req.originalUrl}`,

        status: "404",

        "@type":
          "Error"
      });
  }
);


/*
 * IMPORTANT:
 * Error middleware LAST
 */

app.use(
  errorMiddleware
);


module.exports =
  app;