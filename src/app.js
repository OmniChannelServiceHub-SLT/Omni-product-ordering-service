const express = require("express");

const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const validationMiddleware = require("./middleware/validationMiddleware");

const addVASDataBundlePostPaidRoutes = require(
  "./APIs/orderAddVasBundle/routes/addVASDataBundlePostPaidRoutes"
);
const addVASDataBundlePrepaidInitRoutes = require(
  "./APIs/orderAddVasBundleInit/routes/addVASDataBundlePrepaidInitRoutes"
);
const bbPackageChangeRequestRoutes = require(
  "./APIs/orderBbPackageChange/routes/bbPackageChangeRequestRoutes"
);
const createApplicationLteRoutes = require(
  "./APIs/createApplicationLte/routes/createApplicationLteRoutes"
);
const createOfferingRoutes = require(
  "./APIs/createOffering/routes/createOfferingRoutes"
);
const happyDayRoutes = require(
  "./APIs/selectHappyDay/routes/happyDayRoutes"
);
const listAccountLinkRoutes = require(
  "./APIs/listAccountLink/routes/listAccountLinkRoutes"
);
const listCustConfirmationRoutes = require(
  "./APIs/ListCustConfirmation/routes/listCustConfirmationRoutes"
);
const orderPackageRoutes = require(
  "./APIs/orderPackage/routes/orderPackageRoutes"
);
const packageActivationRoutes = require(
  "./APIs/createPackageActivation/routes/packageActivationRoutes"
);
const {
  patchRouter: patchApplicationLteRoutes,
  legacyPostRouter: patchApplicationLteLegacyRoutes
} = require(
  "./APIs/patchApplicationLte/routes/patchApplicationLteRoutes"
);
const retrieveApplicationLteRoutes = require(
  "./APIs/retrieveApplicationLte/routes/retrieveApplicationLteRoutes"
);
const upgradeLoyaltyRoutes = require(
  "./APIs/requestLoyalty/routes/upgradeLoyaltyRoutes"
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
  "/tmf-api/productOrderingManagement/v1/productOrder/order-package",
  authMiddleware,
  validationMiddleware,
  orderPackageRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/order-package",
  authMiddleware,
  validationMiddleware,
  orderPackageRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/happy-day",
  authMiddleware,
  validationMiddleware,
  happyDayRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/happy-day",
  authMiddleware,
  validationMiddleware,
  happyDayRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v1/productOrder/add-vas-data-bundle-postpaid",
  authMiddleware,
  validationMiddleware,
  addVASDataBundlePostPaidRoutes
);

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder/add-vas-data-bundle-postpaid",
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
  "/tmf-api/productOrderingManagement/v4/productOrder/add-vas-data-bundle-prepaid-init",
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
  "/tmf-api/productOrderingManagement/v4/productOrder/bb-package-change-request",
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
  "/tmf-api/productOrderingManagement/v4/productOrder/upgrade-loyalty",
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
  "/tmf-api/shoppingCart/v1/shoppingCart/application-lte",
  authMiddleware,
  validationMiddleware,
  patchApplicationLteRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte",
  authMiddleware,
  validationMiddleware,
  patchApplicationLteRoutes
);

app.use(
  "/tmf-api/shoppingCart/v1/shoppingCart/application-lte/patch",
  authMiddleware,
  validationMiddleware,
  patchApplicationLteLegacyRoutes
);

app.use(
  "/tmf-api/shoppingCart/v1/shoppingCart/application-lte",
  authMiddleware,
  retrieveApplicationLteRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte",
  authMiddleware,
  retrieveApplicationLteRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v1/productOfferingQualification/account-link",
  authMiddleware,
  listAccountLinkRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v1/productOfferingQualification/offering",
  authMiddleware,
  validationMiddleware,
  createOfferingRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/offering",
  authMiddleware,
  validationMiddleware,
  createOfferingRoutes
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

app.use(
  "/tmf-api/productOrderingManagement/v4/productOrder",
  authMiddleware,
  validationMiddleware,
  productOrderRoutes
);

app.use(
  "/tmf-api/productOfferingQualificationManagement/v4/productOfferingQualification",
  authMiddleware,
  validationMiddleware,
  productOfferingQualificationRoutes
);

app.use(
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification",
  authMiddleware,
  validationMiddleware,
  productOfferingQualificationRoutes
);

app.use(
  "/tmf-api/shoppingCart/v4/shoppingCart",
  authMiddleware,
  validationMiddleware,
  shoppingCartRoutes
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

module.exports =
  app;
