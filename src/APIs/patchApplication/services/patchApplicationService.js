// A118 - UpdateDraftData (patchApplication)
// Inputs and output follow the Excel "MySLT input" and "MySLT output sample".

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

async function patchApplication(input) {
    validateInput(input);

    // TODO: Replace this with the real draft-update backend call when it is
    // available. The response format below matches the "MySLT output sample"
    // for A118 in the Excel sheet.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {},
        errorShow: null,
        errorCode: null
    };
}

module.exports = { patchApplication };