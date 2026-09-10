const mongoose =
  require("mongoose");


const productOrderSchema =
  new mongoose.Schema(
    {

      externalId: {
        type: String
      },

      description: {
        type: String
      },

      state: {
        type: String,
        default: "acknowledged"
      },

      relatedParty: {

        type: [
          mongoose.Schema.Types.Mixed
        ],

        default: []
      },

      productOrderItem: {

        type: [
          mongoose.Schema.Types.Mixed
        ],

        default: []
      },

      legacyOperation: {
        type: String
      },

      legacyPayload: {
        type:
          mongoose.Schema.Types.Mixed
      }

    },

    {

      timestamps: true,

      strict: false
    }
  );


module.exports =
  mongoose.model(
    "TMF622_ProductOrder",
    productOrderSchema
  );