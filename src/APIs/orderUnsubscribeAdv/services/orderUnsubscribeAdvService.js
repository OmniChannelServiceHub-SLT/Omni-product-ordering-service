function validateInput(data = {}) {
    // Required fields from the Excel (A54 - UnsubscribeAdvancedReports)
    const requiredFields = [
        "subscriberID",
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

async function orderUnsubscribeAdv(input) {
    validateInput(input);

    // TODO: Replace this with the real advanced reports unsubscription
    // backend call when it is available. The response format below
    // matches the "MySLT output sample" for A54 in the Excel sheet.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            status: "SUCCESS",
            message: "Enrollement Unsubscribe Successfull",
            path: "/unsubscribe"
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { orderUnsubscribeAdv };