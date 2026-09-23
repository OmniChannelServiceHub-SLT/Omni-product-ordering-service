function buildLegacyResponse(data = {}) {
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            purchasecount: String(
                data.purchasecount ?? "0"
            )
        },
        errorShow: null,
        errorCode: null
    };
}


function toTMF679(input = {}, backend = {}) {
    const {
        subscriberID,
        packageId,
        usageType
    } = input;

    const purchaseCount = String(
        backend.purchasecount ?? "0"
    );

    const qualificationResult =
        purchaseCount === "0"
            ? "qualified"
            : "unqualified";

    return {
        description: "Validate Broadband Purchase Request",

        instantSyncQualification: true,

        relatedParty: subscriberID
            ? [{
                id: String(subscriberID),
                role: "customer",
                "@type": "RelatedParty"
            }]
            : [],

        productOfferingQualificationItem: [{
            id: "1",

            qualificationResult,

            productOffering: {
                id: String(packageId ?? ""),
                name: String(usageType ?? "")
            },

            note: [{
                text: `Purchase count: ${purchaseCount}`
            }],

            "@type": "ProductOfferingQualificationItem"
        }],

        "@type": "ProductOfferingQualification"
    };
}


module.exports = {
    buildLegacyResponse,
    toTMF679
};