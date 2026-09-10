module.exports =
  function errorMiddleware(
    error,
    req,
    res,
    next
  ) {

    console.error(
      "GLOBAL ERROR:",
      error
    );


    const statusCode =
      Number(
        error.statusCode ||
        error.status ||
        500
      );


    const responseFormat =
      String(
        req.headers[
          "x-response-format"
        ] || "tmf"
      ).toLowerCase();


    /*
     * =====================================================
     * Legacy Excel error response
     * =====================================================
     */

    if (
      responseFormat === "legacy"
    ) {

      return res
        .status(statusCode)
        .json({

          isSuccess: false,

          errorMessege: null,

          exceptionDetail: null,

          dataBundle: {

            result: "Error",

            resultDesc:
              error.message ||
              "Internal Server Error"
          },

          errorShow: null,

          errorCode: null
        });
    }


    /*
     * =====================================================
     * TMF Error response
     * =====================================================
     */


    let reason =
      "Internal Server Error";


    if (statusCode === 400) {

      reason =
        "Bad Request";

    } else if (
      statusCode === 401
    ) {

      reason =
        "Unauthorized";

    } else if (
      statusCode === 403
    ) {

      reason =
        "Forbidden";

    } else if (
      statusCode === 404
    ) {

      reason =
        "Not Found";

    } else if (
      statusCode === 409
    ) {

      reason =
        "Conflict";
    }


    return res
      .status(statusCode)
      .json({

        code:
          String(
            error.code ||
            statusCode
          ),

        reason,

        message:
          error.message ||
          reason,

        status:
          String(statusCode),

        "@type":
          "Error"
      });
  };