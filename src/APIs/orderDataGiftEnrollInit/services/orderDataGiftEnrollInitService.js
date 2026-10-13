
function validateInput(query = {}) {
    const requiredFields = [
        "subscriberID",
        "reciever",
        "packageId",
        "channel",
        "url"
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

async function orderDataGiftEnrollInit(query) {
    validateInput(query);

    // TODO: Connect to the approved prepaid initialization and
    // payment orchestration workflow.
    const error = new Error(
        "Prepaid data gift initialization backend integration is not configured."
    );

    error.status = 501;
    throw error;
}

module.exports = { orderDataGiftEnrollInit };
