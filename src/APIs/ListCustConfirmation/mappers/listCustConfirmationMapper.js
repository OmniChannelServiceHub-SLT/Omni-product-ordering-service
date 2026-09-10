function buildLegacyResponse(data = {}) {
    return {
        isSuccess: false,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            opStatus: String(data.opStatus ?? "1"),
            opStatusDescription: String(data.opStatusDescription ?? " ")
        },
        errorShow: null,
        errorCode: null
    };
}

function toTMF679(input = {}, backend = {}) {
    const { userkey, companycode, confirmationtype } = input;
    const opStatus = String(backend.opStatus ?? "1");
    const qualificationResult = opStatus === "0" ? "qualified" : "unqualified";

    return {
        description: "Customer confirmation qualification",
        instantSyncQualification: true,
        relatedParty: userkey ? [{
            id: String(userkey),
            role: "customer",
            "@type": "RelatedParty"
        }] : [],
        channel: companycode ? [{
            id: String(companycode),
            name: String(companycode),
            "@type": "Channel"
        }] : [],
        productOfferingQualificationItem: [{
            id: "1",
            qualificationResult,
            productOffering: {
                id: confirmationtype || "customer-confirmation",
                name: confirmationtype
                    ? `Customer Confirmation - ${confirmationtype}`
                    : "Customer Confirmation"
            },
            note: [{
                text: String(backend.opStatusDescription ?? " ")
            }],
            "@type": "ProductOfferingQualificationItem"
        }],
        "@type": "ProductOfferingQualification"
    };
}

module.exports = { buildLegacyResponse, toTMF679 };
