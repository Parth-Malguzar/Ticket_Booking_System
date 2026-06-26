const meController = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        vendorStatus: user.vendorStatus,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    console.error("meController error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export default meController;
