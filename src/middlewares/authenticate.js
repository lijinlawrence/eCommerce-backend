import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import jwt from 'jsonwebtoken'


export const isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    
   const { token  }  = req.cookies;
   
   if( !token ){
        return next(new ErrorHandler('Login first to handle this resource', 401))
   }

   const decoded = jwt.verify(token, process.env.JWT_SECRET)
   req.user = await User.findById(decoded.id)
   next();
});


export const authorizeRoles = (...roles)=>{
    return  (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed`, 401))
        }
        next()
}}


