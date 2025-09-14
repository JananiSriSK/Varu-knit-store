import mongoose from "mongoose";

const footerSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: "+91 9944610600"
  },
  email: {
    type: String,
    default: "varalakshmikutti76@gmail.com"
  },
  instagram: {
    type: String,
    default: "@varuknitstore"
  },
  whatsappLink: {
    type: String,
    default: "https://wa.me/919944610600"
  },
  instagramLink: {
    type: String,
    default: "https://www.instagram.com/varuknitstore"
  },
  facebookLink: {
    type: String,
    default: "https://www.facebook.com"
  },
  aboutText: {
    type: String,
    default: "Every product is handmade with love, care and attention to detail."
  },
  copyrightText: {
    type: String,
    default: "VaruKnitStore. All rights reserved."
  }
}, {
  timestamps: true
});

export default mongoose.model("Footer", footerSchema);