const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(400, `Duplicate value for ${field}. Already in use.`);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(", "));
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ApiError(400, "File too large. Maximum size is 5 MB.");
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" &&
      err.stack && { stack: err.stack }),
  });
};

module.exports = errorHandler;
