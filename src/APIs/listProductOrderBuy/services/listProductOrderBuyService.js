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

    const subscriberID = String(query.subscriberID).trim();

    // TODO: Replace this sample data with the real purchase-history
    // backend call when it is available. The response format below
    // matches the "MySLT output sample" for A50 in the Excel sheet.
    return [
        {
            purchaseId: "1553186478942404",
            subscriberId: subscriberID,
            vasType: "Extra GB",
            vasPackage: "2 GB",
            uamCat: null,
            startTime: null,
            duration: 0,
            payType: "PostPaid",
            payPrice: "250",
            transactionState: null,
            transactionTime: "2019-03-21 22:11",
            commitUser: "SLT",
            channel: null,
            provisioningString: null,
            basePackage: null,
            failReason: null,
            payParameters: null
        },
        {
            purchaseId: "1553186607004273",
            subscriberId: subscriberID,
            vasType: "Extra GB",
            vasPackage: "5 GB",
            uamCat: null,
            startTime: null,
            duration: 0,
            payType: "PostPaid",
            payPrice: "375",
            transactionState: null,
            transactionTime: "2019-03-21 22:13",
            commitUser: "SLT",
            channel: null,
            provisioningString: null,
            basePackage: null,
            failReason: null,
            payParameters: null
        }
    ];
}

module.exports = { listProductOrderBuy };