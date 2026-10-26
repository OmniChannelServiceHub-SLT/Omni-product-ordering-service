// A112 - GetDraftDetails (retrieveApplication)
// The Excel lists no query inputs for this API (only the Content-Type and
// Authorization headers), and the output is a list of drafts.

async function retrieveApplication() {
    // TODO: Replace this with the real draft-list backend call when it is
    // available. The response format below matches the "MySLT output sample"
    // for A112 in the Excel sheet.
    return {
        isSuccess: true,
        errorMessege: null,
        exceptionDetail: null,
        dataBundle: [
            {
                reF_NO: "FTTH_266",
                requesT_DATE: "8/27/2021 10:47:20 AM",
                nic: "827653713V",
                pp: "",
                title: "Mrs",
                firstname: "Thameera",
                lastname: "Edirisinghe",
                birtH_DATE: "07/02/1982",
                nationality: "SriLankan",
                servicE_ADD_NO: "60",
                servicE_ADD_STREET1: "Biyagama",
                servicE_ADD_STREET2: "Biyagama",
                servicE_ADD_CITY: "Biyagama",
                servicE_ADD_DISTRICT: "Gampaha",
                billinG_ADD_NO: "60",
                billinG_ADD_STREET1: "pANADAUR",
                billinG_ADD_STREET2: "pANADAUR",
                billinG_ADD_CITY: "Biyagama",
                servicE_ADD_POSTAL_CODE: "223",
                rtom: "RT - WT",
                eqtype: "FDP",
                longitude: "2.345",
                latitude: "45.65",
                servicE_TYPE: "FTTH",
                servicE_ADD_PROVINCE: "pANADAUR",
                billinG_ADD_PROVINCE: "pANADAUR",
                voicE_PACKAGE: "pANADAUR",
                bB_PACKAGE: "WEB Familiy",
                peO_PACKAGE: "Gold,peo silver,",
                billinG_ADD_POSTAL_CODE: "34",
                filE_UPLOAD_STATUS: "N",
                reserveD_FACILITY_STATUS: "Y",
                filE_UPLOAD_FACILITY_CALLED: "N",
                reserveD_FACILITY_CALLED: "Y",
                gender: "Female",
                mobileno: "0715364923",
                email: "eathameera@gmail.com",
                billinG_MODE: "eBill",
                iddstatus: "Y",
                useR_COMMENT: "test",
                paymenT_REFUND_CALLED: "N",
                paymenT_REFUND_STATUS: "",
                sltnic: "827653713V",
                looP_AVAILABLITY: "Y"
            }
        ],
        errorShow: null,
        errorCode: null
    };
}

module.exports = { retrieveApplication };