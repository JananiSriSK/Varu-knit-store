import mongoose from "mongoose";

const homepageSchema = new mongoose.Schema({
  welcomeTitle: {
    type: String,
    default: "Welcome !!"
  },
  welcomeSubtitle: {
    type: String,
    default: "Every product is handmade with love, care and attention to detail."
  },
  bannerImage: {
    public_id: String,
    url: String
  },
  phoneNumber: {
    type: String,
    default: "+91 9150324779"
  },
  aboutTitle: {
    type: String,
    default: "Our Story"
  },
  aboutDescription1: String,
  aboutDescription2: String,
  aboutImage: {
    public_id: String,
    url: String
  },
  collectionTitle: {
    type: String,
    default: "Winter Collection"
  },
  collectionBy: {
    type: String,
    default: "By Luis Vuitton"
  },
  collectionDescription: {
    type: String,
    default: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquam iusto, cumque dolores sit odio ex."
  },
  collectionImage: {
    public_id: String,
    url: String
  }
}, {
  timestamps: true
});

export default mongoose.model("Homepage", homepageSchema);