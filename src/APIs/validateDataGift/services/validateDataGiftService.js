const ProductOfferingQualification = require("../../../models/TMF679_ProductOfferingQualification");

const BASE_PATH = "/tmf-api/productOfferingQualification/v4/productOfferingQualification";

function validateInput(query = {}) {
    // Required query parameters from the Excel (A56 - ValidateDataGiftSub)
    const requiredFields = [
        "subscriberID",
        "reciever"
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

/*
 * Convert the saved MongoDB document into a TMF679 ProductOfferingQualification response
 */
function toProductOfferingQualification(doc) {
    const poq = doc.toObject();
    const id = String(poq._id);

    return {
        id,
        href: `${BASE_PATH}/${id}`,
        description: poq.description,
        productOfferingQualificationDate: poq.productOfferingQualificationDate,
        state: poq.state,
        qualificationResult: poq.qualificationResult,
        productOfferingQualificationItem: poq.productOfferingQualificationItem,
        relatedParty: poq.relatedParty,
        "@type": "ProductOfferingQualification"
    };
}

async function validateDataGift(query) {
    validateInput(query);

    const subscriberID = String(query.subscriberID).trim();
    const reciever = String(query.reciever).trim();

    // Business rule: a subscriber cannot gift data to themselves.
    // TODO: Add the real receiver checks from the data gift backend when it is available.
    const isQualified = subscriberID !== reciever;
    const result = isQualified ? "qualified" : "unqualified";

    const item = {
        id: "1",
        state: "done",
        qualificationItemResult: result,
        productOffering: {
            id: "DATAGIFT",
            name: "Data Gift",
            "@referredType": "ProductOffering"
        },
        "@type": "ProductOfferingQualificationItem"
    };

    if (!isQualified) {
        item.eligibilityUnavailabilityReason = [
            {
                code: "SAME_SUBSCRIBER",
                label: "The receiver cannot be the same as the sender"
            }
        ];
    }

    // TMF679: checking if data can be gifted = a ProductOfferingQualification.
    // The sender is the Customer and the receiver is the Beneficiary.
    const poq = await ProductOfferingQualification.create({
        description: "Data Gift receiver validation",
        productOfferingQualificationDate: new Date().toISOString(),
        state: "done",
        qualificationResult: result,
        productOfferingQualificationItem: [item],
        relatedParty: [
            {
                id: subscriberID,
                role: "Customer",
                "@referredType": "Individual"
            },
            {
                id: reciever,
                role: "Beneficiary",
                "@referredType": "Individual"
            }
        ],
        // Keep the original Excel request, so we know where this came from
        legacyOperation: "ValidateDataGiftSub",
        legacyPayload: { subscriberID, reciever }
    });

    return toProductOfferingQualification(poq);
}

module.exports = { validateDataGift };