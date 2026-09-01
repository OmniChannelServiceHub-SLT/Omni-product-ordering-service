const mongoose = require("mongoose");
const schema = new mongoose.Schema({ cartTotalPrice: { type: [mongoose.Schema.Types.Mixed], default: [] }, cartItem: { type: [mongoose.Schema.Types.Mixed], default: [] }, relatedParty: { type: [mongoose.Schema.Types.Mixed], default: [] }, status: { type: String, default: "active" }, legacyOperation: String, legacyPayload: mongoose.Schema.Types.Mixed }, { timestamps: true, strict: false });
module.exports = mongoose.model("TMF663_ShoppingCart", schema);
