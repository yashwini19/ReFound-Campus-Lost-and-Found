
const express = require("express");
const mongoose = require("mongoose");

const Claim = require("../models/Claim");
const Item = require("../models/Item");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/claims
// Submit a claim for a found item.
router.post("/", protect, async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        message: "Please provide at least 5 characters explaining your claim.",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.type !== "found") {
      return res.status(400).json({
        message: "You can only claim items reported as found.",
      });
    }

    if (item.status !== "active") {
      return res.status(400).json({
        message: "This item is no longer available for claims.",
      });
    }

    if (String(item.reportedBy) === String(userId)) {
      return res.status(403).json({
        message: "You cannot claim your own reported item.",
      });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimedBy: userId,
    });

    if (existingClaim) {
      return res.status(409).json({
        message: "You have already submitted a claim for this item.",
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimedBy: userId,
      message: message.trim(),
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate("item")
      .populate("claimedBy", "name email");

    return res.status(201).json({
      message: "Claim submitted successfully.",
      claim: populatedClaim,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted a claim for this item.",
      });
    }

    console.error("Submit claim error:", error);

    return res.status(500).json({
      message: "Unable to submit claim.",
    });
  }
});

// GET /api/claims/my-claims
router.get("/my-claims", protect, async (req, res) => {
  try {
    const claims = await Claim.find({
      claimedBy: req.userId,
    })
      .populate("item")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    console.error("Get my claims error:", error);

    return res.status(500).json({
      message: "Unable to retrieve your claims.",
    });
  }
});

// GET /api/claims/received
router.get("/received", protect, async (req, res) => {
  try {
    const myItems = await Item.find({
      reportedBy: req.userId,
    }).select("_id");

    const itemIds = myItems.map((item) => item._id);

    const claims = await Claim.find({
      item: { $in: itemIds },
    })
      .populate("item")
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    console.error("Get received claims error:", error);

    return res.status(500).json({
      message: "Unable to retrieve received claims.",
    });
  }
});

// PATCH /api/claims/:claimId/review
router.patch("/:claimId/review", protect, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        message: "Invalid claim ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found.",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim has already been reviewed.",
      });
    }

    const item = await Item.findById(claim.item);

    if (!item) {
      return res.status(404).json({
        message: "Related item not found.",
      });
    }

    // Only the original reporter can review a claim.
    if (String(item.reportedBy) !== String(req.userId)) {
      return res.status(403).json({
        message: "Only the item reporter can review claims.",
      });
    }

    if (item.status !== "active") {
      return res.status(400).json({
        message: "This item is no longer available.",
      });
    }

    claim.status = status;
    claim.reviewedBy = req.userId;
    claim.reviewedAt = new Date();

    await claim.save();

    if (status === "approved") {
      item.status = "claimed";
      await item.save();

      // Reject other pending claims for this item.
      await Claim.updateMany(
        {
          item: item._id,
          _id: { $ne: claim._id },
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
            reviewedBy: req.userId,
            reviewedAt: new Date(),
          },
        }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate("item")
      .populate("claimedBy", "name email");

    return res.status(200).json({
      message: `Claim ${status} successfully.`,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Review claim error:", error);

    return res.status(500).json({
      message: "Unable to review claim.",
    });
  }
});

module.exports = router;
