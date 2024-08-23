import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import validator from 'validator'
import jwt from 'jsonwebtoken'
import {createHash, randomBytes } from 'crypto'


const userSchema = mongoose.Schema({
       name : {
        type: String,
        required: [true, 'Please enter name']
    },
    email:{
        type: String,
        required: [true, 'Please enter email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        maxlength: [6, 'Password cannot exceed 6 characters'],
        select: false // means you can access only sected fields only you called
    },
    avatar: {
        type: String
    },
    role :{
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    createdAt :{
        type: Date,
        default: Date.now
    }
});

// Hash the password before saving
userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    this.password  = await bcrypt.hash(this.password, 10)
})

// // Method to compare passwords
userSchema.methods.isValidPassword = async function(enteredPassword){
    return  bcrypt.compare(enteredPassword, this.password)
}

// Method to generate JWT token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
         expiresIn: process.env.JWT_EXPIRES_TIME
     })
 }



//  reset password// Method to generate and hash reset token
userSchema.methods.getResetToken = function() {
    // Generate Token
    const token = randomBytes(20).toString('hex'); // un hashed token
    console.log('Generated Token:', token);

    // Generate Hash and set to resetPasswordToken
    this.resetPasswordToken = createHash('sha256').update(token).digest('hex'); // hashed token
    console.log('Hashed Token:', this.resetPasswordToken);


    // Set token expire time
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    return token;
};




const User = mongoose.model('User', userSchema);

export default User;
