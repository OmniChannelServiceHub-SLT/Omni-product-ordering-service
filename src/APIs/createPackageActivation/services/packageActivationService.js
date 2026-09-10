const ProductOrder =
  require(
    "../../../models/TMF622_ProductOrder"
  );

const {
  mapExcelRequestToTMF622,
  mapSavedOrderToTMFResponse,
  mapToExcelSuccess,
  mapToExcelError,
  mapToTMFError
} = require(
  "../mappers/packageActivationMapper"
);


function getExcelParameters(
  data = {}
) {
  return {
    telephoneNo:
      data.telephoneno ??
      data.telephoneNo,

    packageId:
      data.packageid ??
      data.packageId
  };
}


function validateExcelParameters(
  data
) {
  const {
    telephoneNo,
    packageId
  } = getExcelParameters(data);

  if (
    telephoneNo === undefined ||
    telephoneNo === null ||
    String(telephoneNo).trim() === ""
  ) {
    return {
      valid: false,
      message:
        "telephoneno is required"
    };
  }

  if (
    packageId === undefined ||
    packageId === null ||
    String(packageId).trim() === ""
  ) {
    return {
      valid: false,
      message:
        "packageid is required"
    };
  }

  return {
    valid: true
  };
}


async function callPackageActivationBackend(
  data
) {
  const {
    telephoneNo,
    packageId
  } = getExcelParameters(data);

  console.log(
    "Legacy Package Activation Request:",
    {
      telephoneno:
        telephoneNo,

      packageid:
        packageId
    }
  );

  /*
   * Temporary test response.
   *
   * Actual SLT backend connect karaddi
   * me return eka backend API call ekakin
   * replace karanna.
   */

  return {
    isSuccess: true,

    errorMessege: null,

    exceptionDetail: null,

    dataBundle: {
      result:
        "Success",

      resultDesc:
        "Package activation successful"
    },

    errorShow: null,

    errorCode: null
  };
}


async function createPackageActivation(
  data,
  responseFormat = "tmf"
) {

  /*
   * 1. Excel parameter validation
   */

  const validation =
    validateExcelParameters(data);

  if (!validation.valid) {

    if (
      responseFormat === "legacy"
    ) {
      return {
        statusCode: 400,

        body:
          mapToExcelError(
            {},
            validation.message
          )
      };
    }

    return {
      statusCode: 400,

      body:
        mapToTMFError(
          400,
          "Bad Request",
          validation.message
        )
    };
  }


  /*
   * 2. Excel request -> TMF622
   */

  const tmfProductOrder =
    mapExcelRequestToTMF622(
      data
    );


  /*
   * 3. Save ProductOrder
   */

  let savedOrder;

  try {
    savedOrder =
      await ProductOrder.create(
        tmfProductOrder
      );

  } catch (error) {

    if (
      responseFormat === "legacy"
    ) {
      return {
        statusCode: 500,

        body:
          mapToExcelError(
            {},
            error.message
          )
      };
    }

    return {
      statusCode: 500,

      body:
        mapToTMFError(
          500,
          "Internal Server Error",
          error.message
        )
    };
  }


  /*
   * 4. Backend call
   */

  let backendResponse;

  try {
    backendResponse =
      await callPackageActivationBackend(
        data
      );

  } catch (error) {

    savedOrder.state =
      "failed";

    await savedOrder.save();

    if (
      responseFormat === "legacy"
    ) {
      return {
        statusCode: 500,

        body:
          mapToExcelError(
            {},
            error.message
          )
      };
    }

    return {
      statusCode: 500,

      body:
        mapToTMFError(
          500,
          "Internal Server Error",
          error.message
        )
    };
  }


  /*
   * 5. Detect Excel/backend failure
   */

  const backendFailed =
    backendResponse?.isSuccess === false ||
    String(
      backendResponse
        ?.dataBundle
        ?.result || ""
    ).toLowerCase() === "error";


  if (backendFailed) {

    const failureMessage =
      backendResponse
        ?.dataBundle
        ?.resultDesc ||

      backendResponse
        ?.errorMessege ||

      backendResponse
        ?.exceptionDetail ||

      "Package activation failed";


    savedOrder.state =
      "failed";

    savedOrder.description =
      failureMessage;

    await savedOrder.save();


    if (
      responseFormat === "legacy"
    ) {
      return {
        statusCode: 400,

        body:
          mapToExcelError(
            backendResponse,
            failureMessage
          )
      };
    }


    return {
      statusCode: 400,

      body:
        mapToTMFError(
          400,
          "Package Activation Failed",
          failureMessage
        )
    };
  }


  /*
   * 6. Success
   */

  savedOrder.state =
    "acknowledged";


  if (
    backendResponse
      ?.dataBundle
      ?.resultDesc
  ) {
    savedOrder.description =
      backendResponse
        .dataBundle
        .resultDesc;
  }


  await savedOrder.save();


  /*
   * Excel response
   */

  if (
    responseFormat === "legacy"
  ) {
    return {
      statusCode: 200,

      body:
        mapToExcelSuccess(
          backendResponse
        )
    };
  }


  /*
   * TMF response
   */

  return {
    statusCode: 201,

    body:
      mapSavedOrderToTMFResponse(
        savedOrder
      )
  };
}


module.exports = {
  createPackageActivation
};