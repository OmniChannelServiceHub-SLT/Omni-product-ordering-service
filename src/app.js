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

const retrieveApplicationRoutes = require(
  "./APIs/retrieveApplication/routes/retrieveApplicationRoutes"
);

const productOrderRoutes = require(
  "./APIs/TMF622ProductOrder/routes/productOrderRoutes"
);

const shoppingCartRoutes = require(
  "./APIs/TMF663ShoppingCart/routes/shoppingCartRoutes"
);

const productOfferingQualificationRoutes = require(
  "./APIs/TMF679ProductOfferingQualification/routes/productOfferingQualificationRoutes"
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
  "/tmf-api/productOrderingManagement/v4/productOrder/list-product-order-buy",
  listProductOrderBuyRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/confirm-purchase-extra",
  confirmPurchaseExtraRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/order-buy-adv-reports",
  orderBuyAdvReportsRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/order-unsubscribe-adv",
  orderUnsubscribeAdvRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/order-data-gift-enroll",
  orderDataGiftEnrollRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/validate-data-gift",
  validateDataGiftRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application",
  createApplicationRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application",
  patchApplicationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/order-purchased",
  orderPurchasedRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/generateApplication",
  generateApplicationRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/retrieve-purchase",
  retrievePurchaseRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application",
  retrieveApplicationRoutes
);

/*
 * TMF standard endpoints (used by the CTKs)
 * Keep these AFTER the API routes above
 */

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",
  productOrderRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification",
  productOfferingQualificationRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart",
  shoppingCartRoutes
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