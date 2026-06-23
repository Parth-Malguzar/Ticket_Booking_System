const logoutController = (req, res) => {
  res.clearCookie("token", {//why only name is not enough?
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};

export default logoutController;
