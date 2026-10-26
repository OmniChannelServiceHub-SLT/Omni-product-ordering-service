function validateInput(query = {}) {
    // Required query parameters from the Excel (A56 - ValidateDataGiftSub)
    const requiredFields = [
        "subscriberID",
        "reciever"
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

async function validateDataGift(query) {
    validateInput(query);

    // TODO: Replace this with the real data gift subscription validation
    // backend call when it is available. The response format below matches
    // the "MySLT output sample" for A56 in the Excel sheet.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            status: "SUCCESS",
            message: "Success",
            path: ""
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { validateDataGift };