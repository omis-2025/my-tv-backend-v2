const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Internal server error', statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

const paginated = (res, data, meta) =>
  res.status(200).json({ success: true, data, meta });

module.exports = { success, error, paginated };
