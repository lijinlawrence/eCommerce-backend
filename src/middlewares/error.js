import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") {

    
   
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack, // stack errorHandler la iruntu varum
      error: err,
    });
  }




  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // Handle specific errors
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(value => value.message).join(', ');
      error = new ErrorHandler(message, 400);
    }

    if(err.name == 'CastError'){
      const message = `Resource not found: ${err.path}` ;
        error = new ErrorHandler(message)
        err.statusCode = 400
    }

    if(err.code == 11000){
      const message = `This ${Object.keys(err.keyValue)} is already found use anothor email`;
        error = new ErrorHandler(message, 500)
        err.statusCode = 500
    }

    if(err.name == 'JSONWebTokenError') {
      let message = `JSON Web Token is invalid. Try again`;
      error = new Error(message)
      err.statusCode = 400
  }

  if(err.name == 'TokenExpiredError') {
      let message = `JSON Web Token is expired. Try again`;
      error = new Error(message)
      err.statusCode = 400
  }

    // Generalize error messages in production
    const message = error.message || "Internal Server Error";

    res.status(err.statusCode).json({
      success: false,
      message,
      error: err
    });
  }
};

export default errorMiddleware;
