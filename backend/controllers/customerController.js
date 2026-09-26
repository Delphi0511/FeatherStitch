import Customer from "../models/CustomerProfile.js";

// Creates or updates the signed-in customer's profile; JWT identity prevents saving under another email.
 export const saveCustomer = async (req, res) => {

 try {

   const { name, address, city, state, gender } = req.body;
   if (!name || !address || !city || !state || !gender) {
     return res.status(400).json({ message: "All profile fields are required" });
   }

   const customer = await Customer.findOneAndUpdate(
     { emailId: req.user.email },
     { emailId: req.user.email, name, address, city, state, gender },
     { new: true, upsert: true, runValidators: true }
   );

   res.status(200).json({
     message: "Customer saved successfully",
     customer,
   });

 } catch (error) {

   res.status(500).json({
     message: "Error saving customer"
   });

 }

};

// Stores a Cloudinary profile-image URL on the signed-in customer's existing profile.
export const uploadProfilePic = async (req, res) => {
  try {
    const email = req.user.email;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = req.file.path;

    // 🔥 check existing user
    let user = await Customer.findOne({ emailId: email });

    if (user) {
      user.profilePic = imageUrl;
      await user.save();
    } else {
      user = new Customer({
        emailId: email,
        profilePic: imageUrl,
      });
      await user.save();
    }

    res.json({
      message: "Profile saved",
      user,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// Updates only the customer profile whose email matches the authenticated user.
export const updateCustomer = async (req, res) => {
  try {
    if (req.params.email !== req.user.email) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }
    const updatedCustomer = await Customer.findOneAndUpdate(
      { emailId: req.params.email },
      { ...req.body, emailId: req.user.email },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieves the authenticated customer's own profile while rejecting cross-account lookups.
export const getCustomerByEmail = async (req, res) => {
  try {

    const { email } = req.params;

    if (email !== req.user.email) {
      return res.status(403).json({ message: "You can only view your own profile" });
    }

    const customer = await Customer.findOne({ emailId: email });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
};


