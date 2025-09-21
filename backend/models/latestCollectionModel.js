import mongoose from "mongoose";

const latestCollectionSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one document exists
latestCollectionSchema.index({}, { unique: true });

const LatestCollection = mongoose.model("LatestCollection", latestCollectionSchema);
export default LatestCollection;