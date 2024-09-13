import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import responses from "../utils/response.js";
import sendEmail from "../utils/email.js";
import { createHash } from "crypto";

// Register user - /api/v1/register
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  let avatar = null;
  let BASE_URL = process.env.BACKEND_URL;
  if(process.env.NODE_ENV === "production"){
    BASE_URL = `${req.protocol}://${req.get('host')}`
  }

  if (req.file) {
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`; // original name of th file
    //  console.log(avatar);
  }
  //  console.log(`${BASE_URL}/uploads/user/${req.file.originalname}`);
  // console.log(req.file);

  // Ensure that the arguments are passed as an object
  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  // res.status(200).json({
  //     success: true,
  //     user: user
  // });

  responses(user, 200, res);
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  //finding the user database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  responses(user, 200, res);

  // res.status(200).json({
  //     success: true,
  //     user
  // })
});

// logout user - /api/v1/login

export const logoutUser = (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Loggedout",
    });
};

// forget password - /api/v1/password/forget
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });

  let BASE_URL = process.env.FRONTEND_URL;
  if(process.env.NODE_ENV === "production"){
      BASE_URL = `${req.protocol}://${req.get('host')}`
  }

  //Create reset url
  const resetUrl = `${
    BASE_URL
  }/password/reset/${resetToken}`;
  console.log(resetUrl);
  
  //req.protocol-  http or https
  //req.get('host')-  get the host name of the server

  const message = `Your password reset url is as follows \n\n 
      ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "flipkart Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined; // ippadi use panna mongodb resetbasswordToken ah remove pannum
    user.resetPasswordTokenExpire = undefined; //same as
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

// reset password - /api/v1/password/reset/:token

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now(), //gt-means greater than
    },
  });

  if (!user) {
    return next(new ErrorHandler("Password reset token is invalid or expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });
  responses(user, 201, res);
});

// get user profile - /api/v1/myprofile

export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//change pasword - /api/v1/password/change

export const changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //check old password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    //isValid give me boolean value true or false
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  //assigning new password
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({
    success: true,
  });
});

//update Profile -/api/v1/myprofile/update

export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  let newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  let avatar = null;
  let BASE_URL = process.env.BACKEND_URL;

  if(process.env.NODE_ENV === "production"){
    BASE_URL = `${req.protocol}://${req.get('host')}`
  }

  if (req.file) {
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`; // original name of th file
    //  console.log(avatar);
    newUserData = { ...newUserData, avatar };

    // newUserData.avatar = avatar
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true, //validators run avarathuku @ ka lillama type panna save aavathu
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: Get All Users - /api/v1/admin/users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//Admin: Get Specific User - api/v1/admin/user/:id
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User not found with this id ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: Update User - api/v1/admin/user/:id
export const updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: Delete User - api/v1/admin/user/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User not found with this id ${req.params.id}`)
    );
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
