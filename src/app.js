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
