// A122 - ApplicationGenerator (generateApplication)
// Input follows the Excel "MySLT input". Output is a TMF663 ShoppingCart.

const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

// Reuse the same TMF663 response format as A111, A112 and A118
const {
    toShoppingCart
} = require("../../createApplication/services/createApplicationService");

function validateInput(data = {}) {
    // Required fields from the Excel (A122 - ApplicationGenerator)
    const requiredFields = [
        "existingTP"
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

async function generateApplication(input) {
    validateInput(input);

    const existingTP = String(input.existingTP).trim();

    // The application file name keeps the same format as the Excel sample ("FTTH_351.pdf")
    const appfilename = `FTTH_${Date.now()}.pdf`;

    // TMF663: the generated application is saved as a ShoppingCart.
    // The existing telephone number and the generated PDF file name are
    // kept as characteristics of the cart item.
    // Status "applicationGenerated" keeps it out of the A112 draft list (which shows "active" carts).
    // TODO: Generate the real PDF file (SLT job) when the backend is available.
    const cart = await ShoppingCart.create({
        status: "applicationGenerated",
        validFor: {
            startDateTime: new Date().toISOString()
        },
        cartItem: [
            {
                id: "1",
                action: "add",
                quantity: 1,
                status: "active",
                product: {
                    productCharacteristic: [
                        { name: "existingTP", value: existingTP },
                        { name: "applicationFile", value: appfilename }
                    ]
                },
                "@type": "CartItem"
            }
        ],
        relatedParty: [],
        // Keep the original Excel request, so we know where this cart came from
        legacyOperation: "ApplicationGenerator",
        legacyPayload: { existingTP }
    });

    return toShoppingCart(cart);
}

module.exports = { generateApplication };