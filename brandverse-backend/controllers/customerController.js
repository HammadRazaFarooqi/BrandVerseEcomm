import User from "../models/User.js";

// Update customer profile
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, address } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update simple fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    // Update address
    if (address) {
      user.addresses = [
        {
          street: address,
          isDefault: true,
        },
      ];
    }

    const updatedUser = await user.save();
    res.status(200).json({ message: "Profile updated", customer: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
