const ProductOfferingQualification = require("../../../models/TMF679_ProductOfferingQualification");
const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOfferingQualification/v4/productOfferingQualification";

// usageType values from the Excel (A123)
const ALLOWED_USAGE_TYPES = ["ADDONS", "EXTRAGB"];

function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function validateInput(query = {}) {
    // Required query parameters from the Excel (A123 - ValidateBBPurchaseRequest)
    const requiredFields = [
        "subscriberID",
        "packageId",
        "usageType"
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            query[field] === undefined ||
            query[field] === null ||
            String(query[field]).trim() === ""
    );

    if (missingFields.length > 0) {
        throw createError(
            400,
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );
    }

    const usageType = String(query.usageType).trim().toUpperCase();

    if (!ALLOWED_USAGE_TYPES.includes(usageType)) {
        throw createError(
            400,
            `usageType must be one of: ${ALLOWED_USAGE_TYPES.join(", ")}`
        );
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

async function retrievePurchase(query) {
    validateInput(query);

    const subscriberID = String(query.subscriberID).trim();
    const packageId = String(query.packageId).trim();
    const usageType = String(query.usageType).trim().toUpperCase();

    // Count how many times this subscriber has ordered this package this month
    // (real ProductOrders saved by the TMF622 APIs)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const purchaseCount = await ProductOrder.countDocuments({
        "relatedParty.id": subscriberID,
        "productOrderItem.action": "add",
        "productOrderItem.productOffering.id": packageId,
        orderDate: { $gte: monthStart.toISOString() }
    });

    // TODO: SLT has not confirmed a monthly purchase limit yet.
    // When it is known, return "unqualified" when purchaseCount reaches the limit.
    const result = "qualified";

    // TMF679: "can this subscriber buy this package?" = a ProductOfferingQualification.
    // The purchase count is returned as a product characteristic.
    const poq = await ProductOfferingQualification.create({
        description: "Broadband purchase request validation",
        productOfferingQualificationDate: now.toISOString(),
        state: "done",
        qualificationResult: result,
        productOfferingQualificationItem: [
            {
                id: "1",
                state: "done",
                qualificationItemResult: result,
                productOffering: {
                    id: packageId,
                    name: `${usageType} package ${packageId}`,
                    "@referredType": "ProductOffering"
                },
                product: {
                    productCharacteristic: [
                        { name: "usageType", value: usageType },
                        { name: "purchaseCount", value: purchaseCount }
                    ]
                },
                "@type": "ProductOfferingQualificationItem"
            }
        ],
        relatedParty: [
            {
                id: subscriberID,
                role: "Customer",
                "@referredType": "Individual"
            }
        ],
        // Keep the original Excel request, so we know where this came from
        legacyOperation: "ValidateBBPurchaseRequest",
        legacyPayload: { subscriberID, packageId, usageType }
    });

    return toProductOfferingQualification(poq);
}

module.exports = { retrievePurchase };