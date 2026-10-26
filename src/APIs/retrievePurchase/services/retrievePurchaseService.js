function validateInput(query = {}) {
    // Required query parameters from the Excel (A123 - ValidateBBPurchaseRequest)
    const requiredFields = [
        "subscriberID",
        "packageId",
        "usageType"
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            query[field] === undefined ||
            query[field] === null ||
            String(query[field]).trim() === ""
    );

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );

        error.status = 400;
        throw error;
    }
}

async function retrievePurchase(query) {
    validateInput(query);

    // TODO: Replace this with the real purchase-count backend call
    // when it is available. The response format below matches the
    // "MySLT output sample" for A123 in the Excel sheet.
    // usageType is ADDONS or EXTRAGB in the Excel.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            purchasecount: "0"
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { retrievePurchase };