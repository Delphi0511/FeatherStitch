import Tailor from "../models/TailorProfile.js";
// Creates or updates the authenticated tailor's profile under the JWT email.
export const saveTailor = async (req, res) => {
  try {

    const tailor = await Tailor.findOneAndUpdate(
      { email: req.user.email },
      { ...req.body, email: req.user.email },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      message: "Tailor saved successfully",
      tailor,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// Retrieves a tailor's own profile and prevents lookups of another tailor's data.
export const getTailorByEmail = async (req, res) => {
  try {

    if (req.params.email !== req.user.email) {
      return res.status(403).json({ message: "You can only view your own profile" });
    }

    const tailor = await Tailor.findOne({ email: req.user.email });

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found",
      });
    }

    res.json(tailor);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// Updates the authenticated tailor's profile after confirming email ownership.
export const updateTailor = async (req, res) => {
  try {
    if (req.params.email !== req.user.email) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const updatedTailor = await Tailor.findOneAndUpdate(
      { email: req.user.email },
      { ...req.body, email: req.user.email },
      { new: true, runValidators: true }
    );

    if (!updatedTailor) {
      return res.status(404).json({
        message: "Tailor not found",
      });
    }

    res.json(updatedTailor);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// Saves the Cloudinary profile-image URL for the authenticated tailor.
export const uploadProfilePic = async (req, res) => {
  try {

    const email = req.user.email;

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const imageUrl = req.file.path;

    const tailor = await Tailor.findOneAndUpdate(
      { email: email },
      {
        profilePic: imageUrl,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      message: "Profile picture uploaded",
      tailor,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};
