const { ForbiddenError } = require('../utils/errors');

// Usage: requireRole('staff') or requireRole('customer')
// Always use AFTER authMiddleware since it depends on req.user
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access restricted to: ${roles.join(', ')}`)
      );
    }

    next();
  };
}

module.exports = requireRole;