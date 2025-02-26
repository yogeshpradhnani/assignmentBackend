
import { asyncHandler } from "../utils/asyncHandler.js";
import { Listing } from "../models/listing.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// ✅ Add a new listing (Vendor Only)
export const addListing = asyncHandler(async (req, res) => {
  try {
    // ✅ Check if user is authenticated and a vendor
    console.log(req.user);
    
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    if (req.user.role !== "vendor") {
      throw new ApiError(403, "Forbidden: Only vendors can add listings");
    }

    // ✅ Extract listing data from request body
    const { type, name, address, description, facilities, pricing, images,  } = req.body;

    // ✅ Validate required fields
    if (!type || !name || !address || !pricing ) {
      throw new ApiError(400, "Missing required fields or units");
    }
    // const parsedFacilities = facilities ? JSON.parse(facilities) : [];
      // if (parsedUnits.length === 0) throw new ApiError(400, "At least one unit is required");
  let imagePaths

  
    if (req.files) {
       imagePaths = req.files.map((file) => file.filename);
    } else{
      imagePaths=""
    }
    // ✅ Create new listing
    const newListing = new Listing({
      vendorID: req.user._id,
      type,
      name,
      address,
      description,
      facilities:facilities,
      pricing,
      images:imagePaths,


       // Array of unit IDs
    });

    const response = await newListing.save();
    return res.status(201).json(new ApiResponse(201, response, "Listing created successfully"));

  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Get all listings with unit details & vendor info


export const getAllListings = asyncHandler(async (req, res) => {
  try {
    const { type, location, maxPrice, sortByPrice } = req.query;

    // Build query object
    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (location) {
      query.address = { $regex: location, $options: "i" }; // Case-insensitive search
    }

    if (maxPrice) {
      query.pricing = { $lte: Number(maxPrice) }; // Filter by max price
    }

    // Fetch listings with filters
    let listings = await Listing.find(query)
      .populate("vendorID", "username email contactDetails") // Get vendor details
      .exec();

    // Sorting logic
    if (sortByPrice === "lowToHigh") {
      listings = listings.sort((a, b) => a.pricing - b.pricing);
    } else if (sortByPrice === "highToLow") {
      listings = listings.sort((a, b) => b.pricing - a.pricing);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, listings, "Listings fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


// ✅ Get a specific listing by ID
export const getListingById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const listing = await Listing.findById(id)
    
      .populate("vendorID", "name email contactDetails");

    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    return res.status(200).json(new ApiResponse(200, listing, "Listing fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Update a listing (Vendor Only)
export const updateListing = asyncHandler(async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    // ✅ Ensure only the vendor who created it can update
    if (listing.vendorID.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: You can only update your own listing");
    }

    const updatedListing = await Listing.findByIdAndUpdate(listingId, req.body, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedListing, "Listing updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Delete a listing (Vendor Only)
export const deleteListing = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
 
      

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
 
     
    // ✅ Ensure only the vendor who created it can delete
    if (req.user.role !== "admin" && listing.vendorID.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: Only the admin or the listing owner can delete this listing.");
    }

    await Listing.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, "Listing deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


export const toggleActive =asyncHandler( async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role!= "admin") {
        throw new ApiError(403, "Forbidden: Only admin can toggle listing status");
      }
      
    }
    const  id = req.params.id;
    const { isActive } = req.body;
    console.log(id);
    
    const updatedHotel = await Listing.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!updatedHotel) {
      return res.status(404).json( new ApiError(404, 'Not Found'));
    }

    return res.status(200).json(new ApiResponse(200,updatedHotel,'status updated' ));
  } catch (error) {
    return res.status(404).json( new ApiError(500, error.message));
  }
});
