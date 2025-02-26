import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createUnit, getAllUnits, getUnitByListId } from "../controllers/unit.controller.js";
const router = Router()

// Define routes
router.route('/').post(verifyJWT, createUnit)
router.route('/').get( getAllUnits)
router.route('/:listId').get(verifyJWT, getUnitByListId)


export default router ;