var forbidden_error = new Error();
forbidden_error.status = 403;
forbidden_error.message = "Access Denied! ";

module.exports = forbidden_error;