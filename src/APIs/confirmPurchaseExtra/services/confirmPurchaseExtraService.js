function validateInput(data = {}) {
    // Required fields from the Excel (A52 - PurchaseExtraGBPrepaidConfirm)
    const requiredFields = [
        "subscriberID",
        "purchaseID",
        "payId",
        "pgResponseCode"
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

    // TODO: Replace this with the real prepaid provisioning backend call
    // when it is available.
    // The Excel only documents an error sample for A52:
    //   { "status": "STSTEM_ERROR", "message": "System Error",
    //     "path": "/prePaidPackageProvisioning" }
    // The success response below uses the same shape. Its values are
    // NOT confirmed - check them with the team lead.
    return {
        status: "SUCCESS",
        message: "Success",
        path: "/prePaidPackageProvisioning"
    };
}

module.exports = { confirmPurchaseExtra };