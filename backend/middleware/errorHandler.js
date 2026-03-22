export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err?.name === "MulterError") {
    const code = err.code;
    if (code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "FileTooLarge",
        message: "File exceeds upload limit."
      });
    }
    return res.status(400).json({ error: "UploadError", message: err.message });
  }

  const status = err?.statusCode ?? 500;
  const message = status === 500 ? "Internal server error." : err.message;
  res.status(status).json({
    error: err?.code ?? "ServerError",
    message
  });
}

