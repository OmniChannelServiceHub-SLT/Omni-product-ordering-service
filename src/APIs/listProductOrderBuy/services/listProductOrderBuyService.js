
function validateInput(query = {}) {
    const requiredFields = [
        "subscriberID",
        "historyFrom",
        "historyTo"
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

async function listProductOrderBuy(query) {
    validateInput(query);

    // TODO: Connect to the approved purchase-history data source
    // and implement the documented response format.
    const error = new Error(
        "Purchase history retrieval is not configured."
    );

    error.status = 501;
    throw error;
}

module.exports = { listProductOrderBuy };
