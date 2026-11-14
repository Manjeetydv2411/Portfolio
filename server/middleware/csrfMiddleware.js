export const validateOrigin = (req, res, next) => {
  // Only check state-changing requests
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    const rawOrigin = req.headers.origin || req.headers.referer;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (process.env.NODE_ENV === 'production') {
      if (!rawOrigin) {
        res.status(403);
        return next(new Error('Forbidden: Missing Origin or Referer header.'));
      }

      try {
        const parsedClient = new URL(clientUrl);
        const parsedIncoming = new URL(rawOrigin);

        if (parsedIncoming.origin !== parsedClient.origin) {
          res.status(403);
          return next(new Error('Forbidden: Invalid Origin or Referer header.'));
        }
      } catch (err) {
        res.status(403);
        return next(new Error('Forbidden: Malformed Origin or Referer header.'));
      }
    }
  }
  next();
};
