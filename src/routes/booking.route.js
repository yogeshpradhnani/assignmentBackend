import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cancelBooking, createBooking, getAllBooking, getCustomerBookings, updateBookings } from "../controllers/booking.controller.js";
const router = Router()
router.route('/').post(verifyJWT, createBooking)
router.route('/').get(verifyJWT, getAllBooking)
router.route('/:id').put(verifyJWT, updateBookings)
router.route('/:id').delete(verifyJWT,cancelBooking)
router.route("/customer").get(verifyJWT, getCustomerBookings);


export default router;