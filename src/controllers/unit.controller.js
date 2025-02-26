import { Unit } from "../models/unit.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Create a new unit (Vendor Only)

import { Listing } from "../models/listing.model.js";
import { Review } from "../models/review.model.js";

export const createUnit = async (req, res) => {
  try {
    if(req.user){
      if(req.user.role!== 'vendor'){
        throw new ApiError(403, 'Unauthorized');
      }
    }
    const { list, type, capacity, price, features, availability } = req.body;
    console.log(
      list,
      req.user._id,
      type,
      capacity,
      price,
      features,
      availability,
    );
    

    const listing = await Listing.findById(list);
    if (!listing || !listing.isActive) {
      return res.status(400).json({ message: "Only active listings can add units." });
    }

    const newUnit = new Unit({
      list,
      vendor: req.user._id,
      type,
      capacity,
      price,
      features,
      availability,
    });

    await newUnit.save();
    res.status(201).json({ message: "Unit added successfully", unit: newUnit });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all units with vendor details
export const getAllUnits = asyncHandler(async (req, res) => {
  try {
    const units = await Unit.find().populate("vendorID", "name email contactDetails");

    return res.status(200).json(new ApiResponse(200, units, "Units fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Get a specific unit by ID
export const getUnitById = asyncHandler(async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId).populate("vendorID", "name email contactDetails");

    if (!unit) {
      throw new ApiError(404, "Unit not found");
    }

    return res.status(200).json(new ApiResponse(200, unit, "Unit fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Update a unit (Vendor Only)
export const updateUnit = asyncHandler(async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new ApiError(404, "Unit not found");
    }

    // ✅ Ensure only the vendor who created it can update
    if (unit.vendorID.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: You can only update your own unit");
    }

    const updatedUnit = await Unit.findByIdAndUpdate(unitId, req.body, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedUnit, "Unit updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ✅ Delete a unit (Vendor Only)
export const deleteUnit = asyncHandler(async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new ApiError(404, "Unit not found");
    }

    // ✅ Ensure only the vendor who created it can delete
    if (unit.vendorID.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: You can only delete your own unit");
    }

    await Unit.findByIdAndDelete(unitId);
    return res.status(200).json(new ApiResponse(200, {}, "Unit deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


export const getUnitByListId= asyncHandler(async(req, res)=>{
  try{
    if(req.user){
      if(req.user.role!=='customer'){
        throw new ApiError(403, 'Unauthorized');
      }

    }
    const { listId } = req.params;
    const units = await Unit.find({list: listId})
    .populate("list")
    if(units){
      return res.status(200).json(new ApiResponse(200, units ,"units founded successfully"));
    }
  }
  catch(error){
    throw new ApiError(500, error.message);
  }
})
