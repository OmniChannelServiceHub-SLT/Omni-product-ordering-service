// A118 - UpdateDraftData (patchApplication)
// Inputs follow the Excel "MySLT input". Output is the updated TMF663 ShoppingCart.

const mongoose = require("mongoose");
const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

// Reuse the same Excel -> TMF663 mapping as A111, so both save the cart the same way
const {
    buildShoppingCart,
    toShoppingCart
} = require("../../createApplication/services/createApplicationService");

// All 37 input fields from the Excel
const ALL_FIELDS = [
    "REF_NO",
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
    "USER_COMMENT",
    "SLTNIC",
    "LOOP_AVAILABLITY"
];

// PP (passport) and USER_COMMENT are sent empty in the Excel samples,
// so they are optional (same as A111). All other fields are required.
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

function notFound(refNo) {
    const error = new Error(`Draft application with REF_NO ${refNo} not found`);
    error.status = 404;
    return error;
}

async function patchApplication(input) {
    validateInput(input);

    // REF_NO is the ShoppingCart id returned by A111 createApplication
    const refNo = String(input.REF_NO).trim();

    if (!mongoose.isValidObjectId(refNo)) {
        throw notFound(refNo);
    }

    const cart = buildShoppingCart(input);

    // The 2 extra A118 fields are kept as characteristics on the first cart item
    if (cart.cartItem.length > 0) {
        cart.cartItem[0].product.productCharacteristic.push(
            { name: "SLTNIC", value: String(input.SLTNIC).trim() },
            { name: "LOOP_AVAILABLITY", value: String(input.LOOP_AVAILABLITY).trim() }
        );
    }

    // TMF663: updating a draft application = updating the existing ShoppingCart.
    // TODO: Also send the update to the real NewCon backend when it is available.
    const updated = await ShoppingCart.findOneAndUpdate(
        { _id: refNo, status: "active" },
        {
            $set: {
                ...cart,
                // Keep the original Excel request, so we know where this change came from
                legacyOperation: "UpdateDraftData",
                legacyPayload: input
            }
        },
        { returnDocument: "after" }
    );

    if (!updated) {
        throw notFound(refNo);
    }

    return toShoppingCart(updated);
}

module.exports = { patchApplication };