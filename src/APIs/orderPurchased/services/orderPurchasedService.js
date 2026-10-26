function validateInput(data = {}) {
    // Required fields from the Excel (A121 - PurchasedProducts).
    // "prodcutid" is spelled exactly as in the Excel/legacy API.
    const requiredFields = [
        "telephoneNo",
        "prodcutid",
        "pin"
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

async function orderPurchased(input) {
    validateInput(input);

    // TODO: Replace this with the real PeoTV purchase backend call
    // when it is available.
    // The Excel only documents an error sample for A121:
    //   { "isSuccess": false, "errorMessege": "Connection Number not found.",
    //     "dataBundle": { "message": "Connection Number not found." }, ... }
    // The success response below uses the same shape. Its values are
    // NOT confirmed - check them with the team lead.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            message: "Success"
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { orderPurchased };