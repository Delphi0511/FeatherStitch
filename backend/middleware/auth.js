import jwt from "jsonwebtoken";

// Validates the bearer JWT and attaches its verified identity to the request for downstream authorization.
export const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid authorization header" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// Restricts a protected route to one account role after authentication succeeds.
export const requireRole = (role) => (req, res, next) => {
  if (req.user?.usertype !== role) {
    return res.status(403).json({ message: "You are not authorized to perform this action" });
  }

  next();
};
