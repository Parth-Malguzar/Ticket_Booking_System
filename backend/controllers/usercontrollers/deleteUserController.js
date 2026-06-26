import { User } from "../../models/userModel.js";

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Admin accounts cannot be deleted" });
    }

    await User.findByIdAndDelete(id);
    if(req.io){
      req.io.to("admin_room").emit("stats_update",{
        type:user.role,
        change:-1
      });
    }
    return res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

export default deleteUserController;
