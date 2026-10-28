const {
    buildLegacyResponse,
    toTMF679
} = require("../mappers/listCustConfirmationMapper");

function validateInput(data) {
    const missingFields = [];
    if (!data.userkey) missingFields.push("userkey");
    if (!data.companycode) missingFields.push("companycode");
    if (!data.confirmationtype) missingFields.push("confirmationtype");

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );
        error.status = 400;
        throw error;
    }
}

async function listCustConfirmation(input) {
    validateInput(input);

    // Replace this with the approved real SLT/MYSLT backend call when available.
    const backendResponse = {
        opStatus: "1",
        opStatusDescription: " "
    };

    return {
        tmfResponse: toTMF679(input, backendResponse),
        legacyResponse: buildLegacyResponse(backendResponse)
    };
}

module.exports = { listCustConfirmation };
