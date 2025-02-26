import mongoose, { Schema } from "mongoose";

const unitSchema = new mongoose.Schema({
  list: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  type: { 
    type: String, 
    enum: ["Single Room", "Double Room", "Suite", "Deluxe Room", "Family Room", "VIP Room", // Hotel Room Types
           "Standard Table", "Booth", "Outdoor Table", "VIP Table", "Private Dining"], // Restaurant Table Types
    required: true
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true},
  capacity: { type: Number, required: true }, // Number of people it can accommodate
  price: { type: Number, required: true },
  features: {type: String},
  availability: {
    count: {type: Number, default :0},
    isAvailable: Boolean,
    availableFrom:  String,
  },
}, { timestamps: true });

export const Unit = mongoose.model("Unit", unitSchema);
