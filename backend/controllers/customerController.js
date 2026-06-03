import Customer from "../models/CustomerProfile.js";

 export const saveCustomer = async (req, res) => {

 try {

   const customer = new Customer(req.body);

   await customer.save();

   res.status(200).json({
     message: "Customer saved successfully"
   });

 } catch (error) {

   res.status(500).json({
     message: "Error saving customer"
   });

 }

};

export const uploadProfilePic = async (req, res) => {
  try {
    const email = req.body.userId;

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
export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { emailId: req.params.email },
      req.body,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerByEmail = async (req, res) => {
  try {

    const { email } = req.params;

    const customer = await Customer.findOne({
      emailId: email,
    });

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


