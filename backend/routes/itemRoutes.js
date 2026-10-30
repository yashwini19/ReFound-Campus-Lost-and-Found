
const express = require("express");
const mongoose = require("mongoose");

const Item = require("../models/Item");
const Claim = require("../models/Claim");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Upload image to Cloudinary using a memory buffer
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "refound-items",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// Handle Multer upload errors
const handleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

// CREATE ITEM
router.post("/", protect, handleImageUpload, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category ||
      !type ||
      !location?.trim() ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type.",
      });
    }

    if (Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date.",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await uploadImageToCloudinary(req.file);
      imageUrl = uploadedImage.secure_url;
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      date,
      image: imageUrl,
      reportedBy: req.userId,
    });

    const populatedItem = await Item.findById(item._id)
      .populate("reportedBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Item reported successfully.",
      item: populatedItem,
    });
  } catch (error) {
    console.error("Create item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report item.",
      error: error.message,
    });
  }
});

// GET ALL ACTIVE ITEMS
router.get("/", async (req, res) => {
  try {
    const { type, category, search } = req.query;

    const filter = {
      status: "active",
    };

    if (type && ["lost", "found"].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (search?.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch items.",
    });
  }
});

// GET MY REPORTED ITEMS
router.get("/my-reports", protect, async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.userId,
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get my reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reports.",
    });
  }
});

// UPDATE ITEM STATUS
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const allowedStatuses = ["active", "claimed", "returned"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item status.",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    if (item.reportedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reports.",
      });
    }

    item.status = status;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item status updated successfully.",
      item,
    });
  } catch (error) {
    console.error("Update item status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item status.",
    });
  }
});

// DELETE ITEM
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    if (item.reportedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reports.",
      });
    }

    // Remove associated claims
    await Claim.deleteMany({ item: item._id });

    // Remove image from Cloudinary when available
    if (item.image) {
      try {
        const imageUrl = new URL(item.image);
        const pathParts = imageUrl.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");

        if (uploadIndex !== -1) {
          const publicId = pathParts
            .slice(uploadIndex + 2)
            .join("/")
            .replace(/\.[^/.]+$/, "");

          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (imageError) {
        console.error(
          "Cloudinary image deletion error:",
          imageError.message
        );
      }
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete item.",
    });
  }
});

module.exports = router;
