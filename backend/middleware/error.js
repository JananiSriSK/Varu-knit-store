import HandleError from "../utils/handleError.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  if (err.name === "CastError") {
    const message = `This resource is invalid ${err.path}`;
    err = new HandleError(message, 404);
  }

  //Mongodb duplicate key error
  if (err.code === 11000) {
    const message = `This ${Object.keys(
      err.keyValue
    )} is already registered, please login to continue`;
    err = new HandleError(message, 404);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    //message: err.stack,
  });
};
