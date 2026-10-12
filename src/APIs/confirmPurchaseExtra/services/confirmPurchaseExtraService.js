
function validateInput(data = {}) {
    const requiredFields = [
        "subscriberID",
        "packageId",
        "commitUser",
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

async function confirmPurchaseExtra(input) {
    validateInput(input);

    // TODO: Implement the documented prepaid purchase-confirmation
    // workflow and connect it to the approved backend operation.
    const error = new Error(
        "Prepaid extra GB purchase confirmation is not configured."
    );

    error.status = 501;
    throw error;
}

module.exports = { confirmPurchaseExtra };
