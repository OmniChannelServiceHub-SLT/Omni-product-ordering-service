const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOrderingManagement/v4/productOrder";

function validateInput(data = {}) {
    // Required fields from the Excel (A55 - DataGiftEnroll)
    const requiredFields = [
        "subscriberID",
        "reciever",
        "packageId",
        "channel"
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

/*
 * Convert the saved MongoDB document into a TMF622 ProductOrder response
 */
function toProductOrder(doc) {
    const order = doc.toObject();
    const id = String(order._id);

    return {
        id,
        href: `${BASE_PATH}/${id}`,
        description: order.description,
        category: order.category,
        orderDate: order.orderDate,
        state: order.state,
        channel: order.channel,
        productOrderItem: order.productOrderItem,
        relatedParty: order.relatedParty,
        "@type": "ProductOrder"
    };
}

async function orderDataGiftEnroll(input) {
    validateInput(input);

    const subscriberID = String(input.subscriberID).trim();
    const reciever = String(input.reciever).trim();
    const packageId = String(input.packageId).trim();
    const channel = String(input.channel).trim();

    // TMF622: gifting data = a ProductOrder with one item, action "add".
    // The sender is the Customer and the receiver is the Beneficiary.
    // TODO: Call the real data gift backend here when it is available.
    const order = await ProductOrder.create({
        description: "Data Gift Enrollment",
        category: "DataGift",
        orderDate: new Date().toISOString(),
        state: "acknowledged",
        channel: [
            {
                id: channel,
                name: channel,
                "@type": "ChannelRef"
            }
        ],
        productOrderItem: [
            {
                id: "1",
                action: "add",
                quantity: 1,
                state: "acknowledged",
                productOffering: {
                    id: packageId,
                    name: `Data Gift package ${packageId}`,
                    "@referredType": "ProductOffering"
                },
                "@type": "ProductOrderItem"
            }
        ],
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
        // Keep the original Excel request, so we know where this order came from
        legacyOperation: "DataGiftEnroll",
        legacyPayload: { subscriberID, reciever, packageId, channel }
    });

    return toProductOrder(order);
}

module.exports = { orderDataGiftEnroll };