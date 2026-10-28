// A112 - GetDraftDetails (retrieveApplication)
// The Excel lists no query inputs for this API (only the Content-Type and
// Authorization headers). Output is a list of TMF663 ShoppingCarts.

const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

const BASE_PATH = "/tmf-api/shoppingCart/v4/shoppingCart";

/*
 * Convert a saved MongoDB document into a TMF663 ShoppingCart response
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

async function retrieveApplication() {
    // TMF663: the draft applications = the saved ShoppingCarts that are still "active"
    // (saved by A111 createApplication and updated by A118 patchApplication), newest first.
    const carts = await ShoppingCart.find({ status: "active" }).sort({ createdAt: -1 });

    return carts.map(toShoppingCart);
}

module.exports = { retrieveApplication };