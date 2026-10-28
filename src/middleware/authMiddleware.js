const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({
      code: "401",
      reason: "Unauthorized",
      message: "Bearer token is required",
      status: "401",
      "@type": "Error"
    });
  }

  const secret =
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error(
      "JWT access secret is not configured"
    );
    error.statusCode = 500;
    return next(error);
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(401).json({
      code: "401",
      reason: "Unauthorized",
      message: "Invalid or expired token",
      status: "401",
      "@type": "Error"
    });
  }
};
