const {
    buildLegacyResponse,
    toTMF679
} = require("../mappers/validateDataTransferSubMapper");


function validateInput(data) {
    const missingFields = [];

    if (!data.subscriberID) {
        missingFields.push("subscriberID");
    }

    if (!data.reciever) {
        missingFields.push("reciever");
    }

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );

        error.status = 400;
        throw error;
    }
}


async function validateDataTransferSub(input) {
    validateInput(input);

    // Temporary backend response
    const backendResponse = {
        opStatus: "1",
        opStatusDescription: " "
    };

    return {
        tmfResponse: toTMF679(input, backendResponse),
        legacyResponse: buildLegacyResponse(backendResponse)
    };
}


module.exports = {
    validateDataTransferSub
};