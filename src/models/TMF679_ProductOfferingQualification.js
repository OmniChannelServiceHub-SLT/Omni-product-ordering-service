const mongoose = require("mongoose");
const schema = new mongoose.Schema({ description: String, state: { type: String, default: "done" }, qualificationResult: String, productOfferingQualificationItem: { type: [mongoose.Schema.Types.Mixed], default: [] }, relatedParty: { type: [mongoose.Schema.Types.Mixed], default: [] }, legacyOperation: String, legacyPayload: mongoose.Schema.Types.Mixed }, { timestamps: true, strict: false });
module.exports = mongoose.model("TMF679_ProductOfferingQualification", schema);
