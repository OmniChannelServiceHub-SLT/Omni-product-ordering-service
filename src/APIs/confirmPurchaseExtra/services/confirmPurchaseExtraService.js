const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOrderingManagement/v4/productOrder";

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

/*
 * Convert the saved MongoDB document into a TMF622 ProductOrder response
 */
function toProductOrder(doc) {
    const order = doc.toObject();
    const id = String(order._id);

    return {
        id,
        href: `${BASE_PATH}/${id}`,
        externalId: order.externalId,
        description: order.description,
        category: order.category,
        orderDate: order.orderDate,
        state: order.state,
        productOrderItem: order.productOrderItem,
        relatedParty: order.relatedParty,
        payment: order.payment,
        note: order.note,
        "@type": "ProductOrder"
    };
}

async function confirmPurchaseExtra(input) {
    validateInput(input);

    const subscriberID = String(input.subscriberID).trim();
    const purchaseID = String(input.purchaseID).trim();
    const payId = String(input.payId).trim();
    const pgResponseCode = String(input.pgResponseCode).trim();

    // Payment gateway response code "0" means the payment was successful
    const paymentOk = pgResponseCode === "0";
    const state = paymentOk ? "inProgress" : "failed";

    // TMF622: this confirms the payment of an existing Extra GB purchase.
    // The purchase is found by purchaseID (saved as externalId), so calling
    // confirm again updates the same order instead of creating a second one.
    // TODO: Verify the payment with the real payment gateway backend when it is available.
    const order = await ProductOrder.findOneAndUpdate(
        { externalId: purchaseID },
        {
            $set: {
                description: "Extra GB Purchase (Prepaid) - payment confirmation",
                category: "ExtraGB",
                state,
                productOrderItem: [
                    {
                        id: "1",
                        action: "add",
                        quantity: 1,
                        state,
                        productOffering: {
                            id: "EXTRAGB-PREPAID",
                            name: "Extra GB (Prepaid)",
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
                    }
                ],
                payment: [
                    {
                        id: payId,
                        "@referredType": "Payment"
                    }
                ],
                note: [
                    {
                        text: `Payment gateway response code: ${pgResponseCode}`
                    }
                ],
                // Keep the original Excel request, so we know where this order came from
                legacyOperation: "PurchaseExtraGBPrepaidConfirm",
                legacyPayload: { subscriberID, purchaseID, payId, pgResponseCode }
            },
            // Only set the order date the first time the order is saved
            $setOnInsert: {
                externalId: purchaseID,
                orderDate: new Date().toISOString()
            }
        },
        { upsert: true, returnDocument: "after" }
    );

    return toProductOrder(order);
}

module.exports = { confirmPurchaseExtra };