const { AppError } = require('../utils/errors');
const { Prisma } = require('@prisma/client');

function errorHandler(err, req, res, next) {
  // Known app errors (NotFoundError, ConflictError, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: `Duplicate value for field: ${err.meta?.target}`,
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Record not found',
      });
    }
    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        status: 'error',
        message: 'Related record does not exist',
      });
    }
  }

  // Unknown/unexpected errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

module.exports = errorHandler;