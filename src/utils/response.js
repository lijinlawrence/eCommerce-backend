const responses = (user, statusCode, res) => {
    // Creating JWT Token
    const token = user.getJwtToken();

    // Setting cookies 
    const cookieExpiresTime = process.env.COOKIE_EXPIRES_TIME  // Default to 7 days if not set
   

    const options = {
        expires: new Date(Date.now() + cookieExpiresTime * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'None',  // Required for cross-origin requests (SameSite must be None for cross-origin)
        secure: process.env.NODE_ENV === 'production',  // Secure flag only for production (HTTPS)
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
};

export default responses;
