import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {  addListing, deleteListing, getAllListings, getListingById, toggleActive,  } from "../controllers/listing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route('/').post(verifyJWT,upload.array('images'),addListing)
router.route('/').get(getAllListings)
router.route('/:id').get(getListingById)
router.route('/:id').delete( verifyJWT,deleteListing)
router.route('/:id/toggle').patch( verifyJWT,toggleActive)

export default router;