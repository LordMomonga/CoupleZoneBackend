export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur serveur";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
