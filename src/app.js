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

const authMiddleware =
  require(
    "./middleware/authMiddleware"
  );

const packageActivationRoutes =
  require(
    "./APIs/createPackageActivation/routes/packageActivationRoutes"
  );

const redeemVoucherRoutes =
  require(
    "./APIs/RedeemVoucher/routes/redeemVoucherRoutes"
  );

const happydayRoutes =
  require(
    "./APIs/Happyday/routes/happydayRoutes"
  );

const addVASDataBundlePostPaidRoutes =
  require(
    "./APIs/AddVASDataBundlePostPaid/routes/addVASDataBundlePostPaidRoutes"
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
  "/tmf-api/productOrderingManagement/v1/productOrder/package-activation",

  validationMiddleware,

  packageActivationRoutes
);


app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/redeem-voucher",

  authMiddleware,

  validationMiddleware,

  redeemVoucherRoutes
);


app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/happyday",

  authMiddleware,

  validationMiddleware,

  happydayRoutes
);


app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/add-vas-data-bundle-postpaid",

  authMiddleware,

  validationMiddleware,

  addVASDataBundlePostPaidRoutes
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
