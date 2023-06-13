function addUserMiddleware(req, res, next) {
  res.locals.currentUser = req.user;
  next();
}

module.exports = addUserMiddleware;
