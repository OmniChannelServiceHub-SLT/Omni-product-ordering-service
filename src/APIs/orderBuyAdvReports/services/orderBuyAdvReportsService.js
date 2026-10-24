function validateInput(data = {}) {
    // Required fields from the Excel (A53 - PurchaseAdvancedReportsPostPaid)
    const requiredFields = [
        "subscriberID",
        "reporterPackage",
        "activatedBy"
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
    );

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required field(s): ${missingFields.join(", ")}`
        );

        error.status = 400;
        throw error;
    }
}

async function orderBuyAdvReports(input) {
    validateInput(input);

    // TODO: Replace this with the real advanced reports backend call
    // when it is available. The response format below matches the
    // "MySLT output sample" for A53 in the Excel sheet.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            status: "SUCCESS",
            message: "Advanced Report Enrollement Successfull",
            path: "/enroll"
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { orderBuyAdvReports };