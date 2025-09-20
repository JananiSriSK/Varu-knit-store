import mongoose from "mongoose";

const favoriteCollectionSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one favorite collection document exists
favoriteCollectionSchema.index({}, { unique: true });

export default mongoose.model("FavoriteCollection", favoriteCollectionSchema);