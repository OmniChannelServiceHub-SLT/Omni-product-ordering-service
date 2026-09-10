function mapExcelRequestToTMF622(data) {
  const telephoneNo =
    data.telephoneno ??
    data.telephoneNo;

  const packageId =
    data.packageid ??
    data.packageId;

  return {
    externalId:
      `PACKAGE-ACTIVATION-${Date.now()}`,

    description:
      "Package Activation",

    state:
      "acknowledged",

    relatedParty: [
      {
        id: String(telephoneNo),
        role: "customer",
        "@type": "RelatedParty"
      }
    ],

    productOrderItem: [
      {
        id: "1",

        action: "add",

        state: "acknowledged",

        product: {
          productOffering: {
            id: String(packageId),
            "@type": "ProductOfferingRef"
          },

          "@type": "Product"
        },

        "@type": "ProductOrderItem"
      }
    ],

    legacyOperation:
      "activationPackage",

    legacyPayload: {
      telephoneno:
        String(telephoneNo),

      packageid:
        String(packageId)
    }
  };
}


function mapSavedOrderToTMFResponse(
  savedOrder
) {
  if (
    !savedOrder ||
    !savedOrder._id
  ) {
    throw new Error(
      "A saved ProductOrder with an id is required"
    );
  }

  const id =
    String(savedOrder._id);

  return {
    id,

    href:
      `/tmf-api/productOrderingManagement/v1/productOrder/${id}`,

    externalId:
      savedOrder.externalId,

    description:
      savedOrder.description,

    orderDate:
      savedOrder.createdAt,

    state:
      savedOrder.state,

    relatedParty:
      savedOrder.relatedParty || [],

    productOrderItem:
      savedOrder.productOrderItem || [],

    "@type":
      "ProductOrder"
  };
}


function mapToExcelSuccess(
  backendResponse = {}
) {
  return {
    isSuccess:
      backendResponse.isSuccess ?? true,

    errorMessege:
      backendResponse.errorMessege ?? null,

    exceptionDetail:
      backendResponse.exceptionDetail ?? null,

    dataBundle: {
      result:
        backendResponse
          .dataBundle
          ?.result ||
        "Success",

      resultDesc:
        backendResponse
          .dataBundle
          ?.resultDesc ||
        "Package activation successful"
    },

    errorShow:
      backendResponse.errorShow ?? null,

    errorCode:
      backendResponse.errorCode ?? null
  };
}


function mapToExcelError(
  backendResponse = {},
  fallbackMessage =
    "Package activation failed"
) {
  return {
    isSuccess: false,

    errorMessege:
      backendResponse
        ?.errorMessege ?? null,

    exceptionDetail:
      backendResponse
        ?.exceptionDetail ?? null,

    dataBundle: {
      result:
        backendResponse
          ?.dataBundle
          ?.result ||
        "Error",

      resultDesc:
        backendResponse
          ?.dataBundle
          ?.resultDesc ||
        fallbackMessage
    },

    errorShow:
      backendResponse
        ?.errorShow ?? null,

    errorCode:
      backendResponse
        ?.errorCode ?? null
  };
}


function mapToTMFError(
  statusCode,
  reason,
  message
) {
  return {
    code:
      String(statusCode),

    reason:
      reason || "Bad Request",

    message:
      message ||
      "Package activation failed",

    status:
      String(statusCode),

    "@type":
      "Error"
  };
}


module.exports = {
  mapExcelRequestToTMF622,
  mapSavedOrderToTMFResponse,
  mapToExcelSuccess,
  mapToExcelError,
  mapToTMFError
};