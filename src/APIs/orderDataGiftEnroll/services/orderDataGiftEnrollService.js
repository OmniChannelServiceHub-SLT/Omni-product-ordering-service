function validateInput(data = {}) {
    // Required fields from the Excel (A55 - DataGiftEnroll)
    const requiredFields = [
        "subscriberID",
        "reciever",
        "packageId",
        "channel"
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

async function orderDataGiftEnroll(input) {
    validateInput(input);

    const reciever = String(input.reciever).trim();
    const packageId = String(input.packageId).trim();

    // TODO: Replace this with the real data gift enrollment backend call
    // when it is available. The response format below matches the
    // "MySLT output sample" for A55 in the Excel sheet, where the message
    // is "<transactionId>;<reciever>;<package size>".
    // The package size is assumed from packageId (sample: packageId 1 -> "1 GB").
    const transactionId = String(Date.now());

    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            status: "SUCCESS",
            message: `${transactionId};${reciever};${packageId} GB`,
            path: "/provisionPackage"
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { orderDataGiftEnroll };