class ErrorHandler extends Error {
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor) //stack nu property ku vendi ithu use pannuvaru stack than entha edathila error irukunu kandupidichu tharum
    }
}

export default ErrorHandler