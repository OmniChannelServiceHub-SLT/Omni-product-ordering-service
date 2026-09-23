const {
    buildLegacyResponse,
    toTMF679
} = require("../mappers/validateBBPurchaseRequestMapper");


function validateInput(data) {
    const missingFields = [];

    if (!data.subscriberID) {
        missingFields.push("subscriberID");
    }

    if (!data.packageId) {
        missingFields.push("packageId");
    }

    if (!data.usageType) {
        missingFields.push("usageType");
    }

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );

        error.status = 400;
        throw error;
    }
}


async function validateBBPurchaseRequest(input) {
    validateInput(input);

    // Temporary backend response
    const backendResponse = {
        purchasecount: "0"
    };

    return {
        tmfResponse: toTMF679(
            input,
            backendResponse
        ),

        legacyResponse: buildLegacyResponse(
            backendResponse
        )
    };
}


module.exports = {
    validateBBPurchaseRequest
};