// Validation middleware factory. Pass a Zod schema and specify which
// part of the request to validate (body, query, or params). Returns
// Express middleware that validates and strips unknown fields.
//
// Usage in a route:
//   router.post('/appointments', validate('body', createAppointmentSchema), (req, res) => {
//     // req.body is now validated and typed
//   });

export function validate(source, schema) {
  return (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.') || source,
        message: issue.message,
        code: issue.code,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace the source with validated data (unknown fields are stripped)
    req[source] = result.data;

    next();
  };
}
