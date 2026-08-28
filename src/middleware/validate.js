function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const error = new Error("Request validation failed");
      error.statusCode = 400;
      error.details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      return next(error);
    }

    req.body = result.data.body || req.body;
    req.params = result.data.params || req.params;
    req.query = result.data.query || req.query;
    return next();
  };
}

module.exports = validate;
