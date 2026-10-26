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

    // TODO: Replace this with the real application PDF generation
    // when it is available. The response format below matches the
    // "MySLT output sample" for A122 in the Excel sheet
    // ("appfilename": "FTTH_351.pdf"). The file number is generated here.
    const appfilename = `FTTH_${Date.now()}.pdf`;

    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: {
            appfilename
        },
        errorShow: null,
        errorCode: null
    };
}

module.exports = { generateApplication };