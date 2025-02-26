import { Unit } from "../models/unit.model.js";
import { Booking } from "../models/booking.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking = asyncHandler (async (req, res) => {
  console.log(req.user);
  
  try {
    if (!req.user) {
      throw new ApiError(401, "You must be logged in");
    }
    if (req.user.role !== "customer") {
      throw new ApiError(403, "You must be a customer to create a booking");
    }

    const { listingID, unitID, checkIn, checkOut, amount ,   paymentDetails, noOfUnits } = req.body;
    console.log(
      "Listing ID: ",
      listingID,
      "Unit ID: ",
      unitID,
      "Check-in: ",
      checkIn,
      "Check-out: ",
      checkOut,
      "Payment Details: ",
      paymentDetails,
      "Number of Units: ",
      noOfUnits
    )
  
      
    
    // Validate listing

    // Validate unit
 
    const unit = await Unit.findById(unitID);
    console.log(unit.list._id.toString());
    
  
    if (!unit || unit.list._id.toString() != listingID) {
      return res.status(404).json(new ApiError(404, "Unit not found in this listing"));
    }


    // Check unit availability
    if (unit.availability.count < noOfUnits) {
      return res.status(400).json(new ApiError(400, "Insufficient available units"));
    }

    // Reduce unit availability
    unit.availability.count -= noOfUnits;
    await unit.save();

    
   
    // Create booking
    const newBooking = new Booking({
      customerID: req.user._id,
      listingID,
      unitID,
      noOdBookedUnit : noOfUnits,
      bookingDates: { checkIn, checkOut },
      status: "Pending", // Default to pending
      paymentDetails: {
        amount: paymentDetails.amount,
        paymentStatus: "Pending", // Update once payment is successful
      },
    });
  
    

    
 
    

    const response=await newBooking.save();
  
    

    
    if (response) {
      return res.status(201).json(new ApiResponse(201, response, "Booking created successfully"));
     
    }
   
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message || "Server error"));
  }
}
)
export const cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(new ApiError(404, "Booking not found"));
    }

    // Check if the user is the owner of the booking or an admin
    if (req.user.role !== "vendor" ) {
      return res.status(403).json(new ApiError(403, "Unauthorized to cancel this booking"));
    }

    // Find the unit and restore availability
    const unit = await Unit.findById(booking.unitID);
    
    if (unit) {
      unit.availability.count += booking.noOdBookedUnit || 1; // Increase availability when booking is canceled
      await unit.save();
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Booking canceled successfully"));

  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message || "Error canceling booking"));
  }
};


export const getAllBooking = asyncHandler(async(req, res) => {
  try{
    if(!req.user){
      throw new ApiError(401, "You must be logged in");
    }
   
    if(req.user.role !== "vendor" && req.user.role !== "admin"){
      throw new ApiError(403, "You must be an admin to view all bookings");
    }
   

    
    const bookings = await Booking.find({}).populate('customerID');
  
    
    if(bookings){
      return res.status(200).json(new ApiResponse(200, bookings, "All bookings fetched successfully"));
    }
    return res.status(404).json(new ApiError(404, "No bookings found"));
  }
  catch(error){
    return res.status(500).json(new ApiError(500, error.message || "Server error"));
  }
})

export const updateBookings = asyncHandler(async(req, res)=>{
  try{
    if(!req.user){
      throw new ApiError(401, "You must be logged in");
    }
    if(req.user.role!== "vendor"){
      throw new ApiError(403, "You must be an vendor to update bookings");
    }
    const id= req.params.id
    const { paymentStatus, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status,paymentDetails:{paymentStatus:paymentStatus} }, { new: true });
    if(booking){
      return res.status(200).json(new ApiResponse(200, booking, "Booking status updated successfully"));
    }
    return res.status(404).json(new ApiError(404, "Booking not found"));
  }
  catch(error){
    return res.status(500).json(new ApiError(500, error.message || "Server error"));
  }
})

export const getCustomerBookings = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "You must be logged in");
    }

    // Get customer ID from authenticated user
    const customerId = req.user.id;

    // Find all bookings that belong to the customer
    const bookings = await Booking.find({ customerID: customerId }).populate('unitID')
    .populate('listingID');

    if (!bookings || bookings.length === 0) {
      return res.status(404).json(new ApiError(404, "No bookings found for this customer"));
    }

    return res.status(200).json(new ApiResponse(200, bookings, "Customer bookings fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message || "Server error"));
  }
});