
function validateInput(data = {}) {
    const missingFields = [];

    if (!data.subscriberID) {
        missingFields.push("subscriberID");
    }

    if (!data.packageId) {
        missingFields.push("packageId");
    }

    if (!data.commitUser) {
        missingFields.push("commitUser");
    }

    if (!data.channel) {
        missingFields.push("channel");
    }

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );

        error.status = 400;
        throw error;
    }
}

async function orderPurchaseExtraGb(input) {
    validateInput(input);

    // Backend integration and approved TMF622 response
    // are pending verification.
    throw Object.assign(
        new Error(
            "PurchaseExtraGBPostpaid backend integration is not configured."
        ),
        { status: 501 }
    );
}

module.exports = { orderPurchaseExtraGb };
