// A111 - SaveDraftData (createApplication)
// Inputs follow the Excel "MySLT input". Output is a TMF663 ShoppingCart.

const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

const BASE_PATH = "/tmf-api/shoppingCart/v4/shoppingCart";

// All 34 input fields from the Excel
const ALL_FIELDS = [
    "NIC",
    "PP",
    "TITLE",
    "FIRSTNAME",
    "LASTNAME",
    "BIRTH_DATE",
    "NATIONALITY",
    "SERVICE_ADD_NO",
    "SERVICE_ADD_STREET1",
    "SERVICE_ADD_STREET2",
    "SERVICE_ADD_CITY",
    "SERVICE_ADD_DISTRICT",
    "SERVICE_ADD_PROVINCE",
    "SERVICE_ADD_POSTAL_CODE",
    "BILLING_ADD_NO",
    "BILLING_ADD_STREET1",
    "BILLING_ADD_STREET2",
    "BILLING_ADD_CITY",
    "BILLING_ADD_PROVINCE",
    "BILLING_ADD_POSTAL_CODE",
    "RTOM",
    "EQTYPE",
    "LONGITUDE",
    "LATITUDE",
    "SERVICE_TYPE",
    "VOICE_PACKAGE",
    "BB_PACKAGE",
    "PEO_PACKAGE",
    "GENDER",
    "MOBILENO",
    "EMAIL",
    "BILLING_MODE",
    "IDDSTATUS",
    "USER_COMMENT"
];

// PP (passport) and USER_COMMENT are sent empty in the Excel sample,
// so they are optional. All other fields are required.
// TODO: Confirm the required/optional fields with the team lead.
const OPTIONAL_FIELDS = ["PP", "USER_COMMENT"];

const REQUIRED_FIELDS = ALL_FIELDS.filter(
    (field) => !OPTIONAL_FIELDS.includes(field)
);

function validateInput(data = {}) {
    const missingFields = REQUIRED_FIELDS.filter(
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
 * Build the TMF663 ShoppingCart fields from the Excel application fields.
 * (Also used by A118 patchApplication, so both save the cart the same way.)
 */
function buildShoppingCart(data) {
    const value = (field) =>
        data[field] === undefined || data[field] === null ? "" : String(data[field]).trim();

    // The 3 packages the customer chose become the cart items
    const packages = [
        { field: "VOICE_PACKAGE", name: "Voice" },
        { field: "BB_PACKAGE", name: "Broadband" },
        { field: "PEO_PACKAGE", name: "PeoTV" }
    ];

    const cartItem = packages
        .filter((pkg) => value(pkg.field) !== "")
        .map((pkg, index) => ({
            id: String(index + 1),
            action: "add",
            quantity: 1,
            status: "active",
            productOffering: {
                id: value(pkg.field),
                name: `${pkg.name} package ${value(pkg.field)}`,
                "@referredType": "ProductOffering"
            },
            product: {
                productCharacteristic: [
                    { name: "SERVICE_TYPE", value: value("SERVICE_TYPE") }
                ]
            },
            "@type": "CartItem"
        }));

    // Everything else about the connection is kept as characteristics on the first item
    const extraFields = [
        "PP", "BIRTH_DATE", "NATIONALITY", "GENDER", "RTOM", "EQTYPE",
        "LONGITUDE", "LATITUDE", "BILLING_MODE", "IDDSTATUS", "USER_COMMENT"
    ];

    if (cartItem.length > 0) {
        for (const field of extraFields) {
            cartItem[0].product.productCharacteristic.push({ name: field, value: value(field) });
        }
    }

    return {
        cartItem,
        relatedParty: [
            {
                id: value("NIC"),
                name: `${value("TITLE")} ${value("FIRSTNAME")} ${value("LASTNAME")}`.trim(),
                role: "Customer",
                "@referredType": "Individual"
            }
        ],
        contactMedium: [
            {
                mediumType: "mobile",
                preferred: true,
                characteristic: { phoneNumber: value("MOBILENO") }
            },
            {
                mediumType: "email",
                preferred: false,
                characteristic: { emailAddress: value("EMAIL") }
            },
            {
                mediumType: "serviceAddress",
                preferred: false,
                characteristic: {
                    street1: `${value("SERVICE_ADD_NO")} ${value("SERVICE_ADD_STREET1")}`.trim(),
                    street2: value("SERVICE_ADD_STREET2"),
                    city: value("SERVICE_ADD_CITY"),
                    district: value("SERVICE_ADD_DISTRICT"),
                    stateOrProvince: value("SERVICE_ADD_PROVINCE"),
                    postCode: value("SERVICE_ADD_POSTAL_CODE")
                }
            },
            {
                mediumType: "billingAddress",
                preferred: false,
                characteristic: {
                    street1: `${value("BILLING_ADD_NO")} ${value("BILLING_ADD_STREET1")}`.trim(),
                    street2: value("BILLING_ADD_STREET2"),
                    city: value("BILLING_ADD_CITY"),
                    stateOrProvince: value("BILLING_ADD_PROVINCE"),
                    postCode: value("BILLING_ADD_POSTAL_CODE")
                }
            }
        ]
    };
}

/*
 * Convert the saved MongoDB document into a TMF663 ShoppingCart response
 */
function toShoppingCart(doc) {
    const cart = doc.toObject();
    const id = String(cart._id);

    return {
        id,
        href: `${BASE_PATH}/${id}`,
        status: cart.status,
        validFor: cart.validFor,
        cartItem: cart.cartItem,
        relatedParty: cart.relatedParty,
        contactMedium: cart.contactMedium,
        "@type": "ShoppingCart"
    };
}

async function createApplication(input) {
    validateInput(input);

    // TMF663: a saved (draft) connection application = a ShoppingCart with status "active".
    // The cart id is the application reference (REF_NO) used by A118 and A122.
    // TODO: Also send the draft to the real NewCon backend when it is available.
    const cart = await ShoppingCart.create({
        ...buildShoppingCart(input),
        status: "active",
        validFor: {
            startDateTime: new Date().toISOString()
        },
        // Keep the original Excel request, so we know where this cart came from
        legacyOperation: "SaveDraftData",
        legacyPayload: input
    });

    return toShoppingCart(cart);
}

module.exports = { createApplication, buildShoppingCart, toShoppingCart };