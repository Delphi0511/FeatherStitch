// Last-resort handlers so every failure reaches the client as JSON (never Express's HTML
// error page, which also leaks file paths). Express 5 routes async errors here too.

// Any route that didn't match: /api/whatever-typo -> 404 JSON.
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}` });
};

// Maps known error kinds to a status and a message the user can act on; everything else is a 500.
function describe(err) {
  // Malformed JSON body / body too large (from express.json).
  if (err.type === "entity.parse.failed") return [400, "The request body is not valid JSON"];
  if (err.type === "entity.too.large") return [413, "The request is too large"];

  // File uploads (multer) and Cloudinary upload rejections, e.g. an unsupported image format.
  if (err.name === "MulterError") return [400, err.code === "LIMIT_UNEXPECTED_FILE" ? "Unexpected or too many files" : err.message];
  if (err.http_code >= 400 && err.http_code < 500) return [400, err.message || "The file could not be uploaded"];

  // Mongoose: invalid ids and failed validation are client mistakes, not server faults.
  if (err.name === "CastError") return [400, `Invalid value for ${err.path}`];
  if (err.name === "ValidationError") {
    return [400, Object.values(err.errors).map((e) => e.message).join(", ") || "Invalid data"];
  }
  if (err.code === 11000) return [409, "That record already exists"];

  const status = Number(err.status || err.statusCode);
  if (status >= 400 && status < 500) return [status, err.message || "Bad request"];

  return [500, "Internal Server Error"];
}

// eslint-disable-next-line no-unused-vars -- Express recognises error handlers by their 4 arguments.
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const [status, message] = describe(err);
  if (status >= 500) console.error(`${req.method} ${req.originalUrl} failed:`, err);

  res.status(status).json({ success: false, message });
};
