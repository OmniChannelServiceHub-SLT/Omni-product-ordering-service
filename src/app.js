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