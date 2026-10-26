const express = require("express");

const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const validationMiddleware = require("./middleware/validationMiddleware");

const addVASDataBundlePostPaidRoutes = require(
  "./APIs/AddVASDataBundlePostPaid/routes/addVASDataBundlePostPaidRoutes"
);
const addVASDataBundlePrepaidInitRoutes = require(
  "./APIs/AddVASDataBundlePrepaidInit/routes/addVASDataBundlePrepaidInitRoutes"
);
const bbPackageChangeRequestRoutes = require(
  "./APIs/BBPackageChangeRequest/routes/bbPackageChangeRequestRoutes"
);
const createApplicationLteRoutes = require(
  "./APIs/CreateApplicationLte/routes/createApplicationLteRoutes"
);
const listAccountLinkRoutes = require(
  "./APIs/ListAccountLink/routes/listAccountLinkRoutes"
);
const listCustConfirmationRoutes = require(
  "./APIs/ListCustConfirmation/routes/listCustConfirmationRoutes"
);
const packageActivationRoutes = require(
  "./APIs/createPackageActivation/routes/packageActivationRoutes"
);
const upgradeLoyaltyRoutes = require(
  "./APIs/UpgradeLoyalty/routes/upgradeLoyaltyRoutes"
);

const app = express();

app.use(
  express.json({
    type: ["application/json", "application/merge-patch+json"]
  })
);

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "UP",
    service: "product-ordering-service"
  });
});

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/package-activation",
  validationMiddleware,
  packageActivationRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/add-vas-data-bundle-postpaid",
  authMiddleware,
  validationMiddleware,
  addVASDataBundlePostPaidRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/add-vas-data-bundle-prepaid-init",
  authMiddleware,
  validationMiddleware,
  addVASDataBundlePrepaidInitRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/bb-package-change-request",
  authMiddleware,
  validationMiddleware,
  bbPackageChangeRequestRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/upgrade-loyalty",
  authMiddleware,
  validationMiddleware,
  upgradeLoyaltyRoutes
);

app.use(
  "/tmf-api/shoppingCart/v1/shoppingCart/application-lte",
  authMiddleware,
  validationMiddleware,
  createApplicationLteRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte",
  authMiddleware,
  validationMiddleware,
  createApplicationLteRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v1/productOfferingQualification/account-link",
  authMiddleware,
  listAccountLinkRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v1/productOfferingQualification",
  authMiddleware,
  validationMiddleware,
  listCustConfirmationRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/account-link",
  authMiddleware,
  listAccountLinkRoutes
);

app.use((req, res) => {
  return res.status(404).json({
    code: "404",
    reason: "Not Found",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    status: "404",
    "@type": "Error"
  });
});

app.use(errorMiddleware);

module.exports = app;
