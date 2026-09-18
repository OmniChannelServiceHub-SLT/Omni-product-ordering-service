function buildLegacyResponse(data = {}) {
    return {
        isSuccess: false,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            opStatus: String(data.opStatus ?? "1"),
            opStatusDescription: String(
                data.opStatusDescription ?? " "
            )
        },
        errorShow: null,
        errorCode: null
    };
}


function toTMF679(input = {}, backend = {}) {
    const {
        subscriberID,
        reciever
    } = input;

    const opStatus = String(
        backend.opStatus ?? "1"
    );

    const qualificationResult =
        opStatus === "0"
            ? "qualified"
            : "unqualified";

    return {
        description: "Validate Data Transfer Subscriber",
        instantSyncQualification: true,

        relatedParty: subscriberID
            ? [{
                id: String(subscriberID),
                role: "customer",
                "@type": "RelatedParty"
            }]
            : [],

        channel: reciever
            ? [{
                id: String(reciever),
                name: String(reciever),
                "@type": "Channel"
            }]
            : [],

        productOfferingQualificationItem: [{
            id: "1",
            qualificationResult,

            productOffering: {
                id: "validate-data-transfer-sub",
                name: "Validate Data Transfer Subscriber"
            },

            note: [{
                text: String(
                    backend.opStatusDescription ?? " "
                )
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