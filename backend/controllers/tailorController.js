import Tailor from "../models/TailorProfile.js";
export const saveTailor = async (req, res) => {
  try {

    const tailor = await Tailor.findOneAndUpdate(
      { email: req.body.email },
      req.body,
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
export const getTailorByEmail = async (req, res) => {
  try {

    const tailor = await Tailor.findOne({
      email: req.params.email,
    });

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
export const updateTailor = async (req, res) => {
  try {

    const updatedTailor = await Tailor.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
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
export const uploadProfilePic = async (req, res) => {
  try {

    const email = req.body.userId;

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