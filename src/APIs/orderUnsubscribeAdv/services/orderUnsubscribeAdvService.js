const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOrderingManagement/v4/productOrder";

function validateInput(data = {}) {
    // Required fields from the Excel (A54 - UnsubscribeAdvancedReports)
    const requiredFields = [
        "subscriberID",
        "activatedBy"
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

async function orderUnsubscribeAdv(input) {
    validateInput(input);

    const subscriberID = String(input.subscriberID).trim();
    const activatedBy = String(input.activatedBy).trim();

    // TMF622: unsubscribing = a ProductOrder with one item, action "delete",
    // that points to the subscriber's installed Advanced Reports product.
    // TODO: Call the real unsubscribe backend here when it is available.
    const order = await ProductOrder.create({
        description: "Unsubscribe Advanced Reports",
        category: "AdvancedReports",
        orderDate: new Date().toISOString(),
        state: "acknowledged",
        channel: [
            {
                id: activatedBy,
                name: activatedBy,
                "@type": "ChannelRef"
            }
        ],
        productOrderItem: [
            {
                id: "1",
                action: "delete",
                quantity: 1,
                state: "acknowledged",
                product: {
                    id: `ADVREPORTS-${subscriberID}`,
                    name: "Advanced Reports",
                    "@referredType": "Product"
                },
                "@type": "ProductOrderItem"
            }
        ],
        relatedParty: [
            {
                id: subscriberID,
                role: "Customer",
                "@referredType": "Individual"
            }
        ],
        // Keep the original Excel request, so we know where this order came from
        legacyOperation: "UnsubscribeAdvancedReports",
        legacyPayload: { subscriberID, activatedBy }
    });

    return toProductOrder(order);
}

module.exports = { orderUnsubscribeAdv };