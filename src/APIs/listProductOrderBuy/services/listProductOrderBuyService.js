const ProductOrder = require("../../../models/TMF622_ProductOrder");

const BASE_PATH = "/tmf-api/productOrderingManagement/v4/productOrder";

// Fields stored in MongoDB that must not be shown in the TMF response
const HIDDEN_FIELDS = ["_id", "__v", "createdAt", "updatedAt", "legacyOperation", "legacyPayload"];

function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function validateInput(query = {}) {
    // Required query parameters from the Excel (A50 - GetPurchaseHistory)
    const requiredFields = [
        "subscriberID",
        "historyFrom",
        "historyTo"
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            query[field] === undefined ||
            query[field] === null ||
            String(query[field]).trim() === ""
    );

    if (missingFields.length > 0) {
        throw createError(
            400,
            `Missing required query parameter(s): ${missingFields.join(", ")}`
        );
    }
}

/*
 * Turn "2020-10-20" or "2020-10-20 00:00:00" into a Date.
 * If only a date is given for historyTo, use the end of that day.
 */
function parseDate(value, fieldName, endOfDay) {
    const text = String(value).trim();
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);

    const date = dateOnly
        ? new Date(`${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
        : new Date(text.replace(" ", "T") + (text.endsWith("Z") ? "" : "Z"));

    if (Number.isNaN(date.getTime())) {
        throw createError(400, `${fieldName} must be a valid date, e.g. 2020-10-20`);
    }

    return date;
}

/*
 * Convert a saved MongoDB document into a TMF622 ProductOrder
 */
function toProductOrder(doc) {
    const order = doc.toObject();
    const id = String(order._id);

    const result = {
        id,
        href: `${BASE_PATH}/${id}`
    };

    for (const key of Object.keys(order)) {
        if (!HIDDEN_FIELDS.includes(key)) {
            result[key] = order[key];
        }
    }

    result["@type"] = "ProductOrder";

    return result;
}

async function listProductOrderBuy(query) {
    validateInput(query);

    const subscriberID = String(query.subscriberID).trim();
    const from = parseDate(query.historyFrom, "historyFrom", false);
    const to = parseDate(query.historyTo, "historyTo", true);

    if (from > to) {
        throw createError(400, "historyFrom must be before historyTo");
    }

    // TMF622: purchase history = the ProductOrders of this subscriber
    // whose orderDate is between historyFrom and historyTo
    const orders = await ProductOrder.find({
        "relatedParty.id": subscriberID,
        orderDate: {
            $gte: from.toISOString(),
            $lte: to.toISOString()
        }
    }).sort({ orderDate: -1 });

    return orders.map(toProductOrder);
}

module.exports = { listProductOrderBuy };