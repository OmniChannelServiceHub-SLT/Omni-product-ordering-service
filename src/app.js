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

const packageActivationRoutes =
  require(
    "./APIs/createPackageActivation/routes/packageActivationRoutes"
  );

const listCustConfirmationRoutes =
  require(
    "./APIs/ListCustConfirmation/routes/listCustConfirmationRoutes"
  );

const validateDataTransferSubRoutes = require(
  "./APIs/createValidateDataTransferSub/routes/validateDataTransferSubRoutes"
);

const validateGataGifSubRoutes = require(
  "./APIs/createValidateGataGifSub/routes/validateGataGifSubRoutes"
);

const validateBBPurchaseRequestRoutes = require(
  "./APIs/createValidateBBPurchaseRequest/routes/validateBBPurchaseRequestRoutes"
);


const orderPurchaseExtraGbRoutes = require(
  "./APIs/orderPurchaseExtraGb/routes/orderPurchaseExtraGbRoutes"
);

const orderPurchaseExtraGbInitRoutes = require(
  "./APIs/orderPurchaseExtraGbInit/routes/orderPurchaseExtraGbInitRoutes"
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
  "/tmf-api/productOrderingManagement/v4/productOrder/package-activation",

  validationMiddleware,

  packageActivationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",

  listCustConfirmationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",
  validateDataTransferSubRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",
  validateGataGifSubRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",
  validateBBPurchaseRequestRoutes
);


app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderPurchaseExtraGb",
  orderPurchaseExtraGbRoutes
);


app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/orderPurchaseExtraGbInit",
  orderPurchaseExtraGbInitRoutes
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
