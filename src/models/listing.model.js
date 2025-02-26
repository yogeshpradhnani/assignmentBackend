import mongoose, { model } from "mongoose";

const listingSchema = new mongoose.Schema({
    vendorID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["Hotel", "Restaurant"], required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    facilities: [{ type: String }], // Example: ["WiFi", "Parking"]
    pricing: { type: Number, required: true }, // Base price
    images: [{ type: String }], // Array of image ,
    isActive :{
        type: Boolean,
        default: false
    }
  }, { timestamps: true });



export const Listing = model("Listing",listingSchema)    