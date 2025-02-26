import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    bookingID: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    timestamp: { type: Date, default: Date.now },
  }, { timestamps: true });
  
  export const Review = mongoose.model("Review", reviewSchema);
  