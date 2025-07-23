export const sendToken = (user, StatusCode, res) => {
  const token = user.getJWTToken();

  //storing token in cookie - options for cookies

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ), //expire after 2 days
    httpOnly: true, //cookie accessed through server and not through javascript
  }; //add more properties for production

  res.status(StatusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};
