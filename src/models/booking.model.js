import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingID: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    unitID: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    noOdBookedUnit: { type: Number,  required: true },
    bookingDates: {
      checkIn: { type: Date },
      checkOut: { type: Date },
    },      
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
    paymentDetails: {
      amount: { type: Number, required: true },
      paymentStatus: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Pending" },
    },
  }, { timestamps: true });
  
  export const Booking = mongoose.model("Booking", bookingSchema);
  