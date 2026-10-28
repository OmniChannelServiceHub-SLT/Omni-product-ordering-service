const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOrderingManagement/v4/productOrder";

function validateInput(data = {}) {
    // Required fields from the Excel (A121 - PurchasedProducts)
    // "prodcutid" is spelled exactly as in the Excel
    const requiredFields = [
        "telephoneNo",
        "prodcutid",
        "pin"
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
        productOrderItem: order.productOrderItem,
        relatedParty: order.relatedParty,
        "@type": "ProductOrder"
    };
}

async function orderPurchased(input) {
    validateInput(input);

    const telephoneNo = String(input.telephoneNo).trim();
    const prodcutid = String(input.prodcutid).trim();

    // The PIN is only needed to authorise the purchase.
    // It is a secret, so it is NOT saved in MongoDB and NOT returned.
    // TODO: Verify the PIN with the real PeoTV VAS backend when it is available.

    // TMF622: buying a PeoTV VAS product = a ProductOrder with one item, action "add"
    const order = await ProductOrder.create({
        description: "PeoTV VAS Product Purchase",
        category: "PeoTVVAS",
        orderDate: new Date().toISOString(),
        state: "acknowledged",
        productOrderItem: [
            {
                id: "1",
                action: "add",
                quantity: 1,
                state: "acknowledged",
                productOffering: {
                    id: prodcutid,
                    name: `PeoTV VAS product ${prodcutid}`,
                    "@referredType": "ProductOffering"
                },
                "@type": "ProductOrderItem"
            }
        ],
        relatedParty: [
            {
                id: telephoneNo,
                role: "Customer",
                "@referredType": "Individual"
            }
        ],
        // Keep the original Excel request (without the PIN)
        legacyOperation: "PurchasedProducts",
        legacyPayload: { telephoneNo, prodcutid }
    });

    return toProductOrder(order);
}

module.exports = { orderPurchased };