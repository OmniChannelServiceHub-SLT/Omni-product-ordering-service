const mongoose = require("mongoose");
const schema = new mongoose.Schema({ externalId: String, description: String, state: { type: String, default: "acknowledged" }, 
    relatedParty: { type: [mongoose.Schema.Types.Mixed], default: [] }, productOrderItem: { type: [mongoose.Schema.Types.Mixed], default: [] }, channel: { type: [mongoose.Schema.Types.Mixed], default: [] }, legacyOperation: String, legacyPayload: mongoose.Schema.Types.Mixed }, { timestamps: true, strict: false });
module.exports = mongoose.model("TMF622_ProductOrder", schema);
