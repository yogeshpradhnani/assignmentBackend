
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)

        const accessToken =  user.generateAccessToken()
        // console.log(accessToken);
        
        const refreshToken = user.generateRefreshToken()
 
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
     
        
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const createUser = asyncHandler(async(req , res)=>{
   try {
     const { username, email, password,role ,phone,address} = req.body;
     // Validate inputs
     if (
         [username, email,  password].some((field) => field?.trim() === "")
     ) {
         throw new ApiError(400, "All fields are required")
     }
     // check email validation 
 //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 //  if (!emailRegex.test(email)) {
 //         throw new ApiError(400, "Invalid email format");
 //     }
     
     // Check if username or email already exists
     const existingUser = await User.findOne({
         $or: [{ username }, { email }],
     });
     if (existingUser) {
         throw new ApiError(400, "username or email already exists");
         
     }
     // Create new user
     const user = await User.create({
         username,
         email,
         password,
         role,
         contactDetails:{phone: phone,
         address : address
         }

     });
     res.status(201).json( new ApiResponse(201, user, 'registered successfully'))
   } catch (error) {
     throw new ApiError(500, error.message);
    
   }

})
const loginUser = asyncHandler ( async (req, res) =>{
    try {
        const {username, email, password } = req.body || req.params;
        // Validate inputs
        if ([email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Email and password are required");
        }
        // Authenticate user
        const user = await User.findOne(
             {email}
        )
    
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }
    
       const isPasswordValid = await user.isPasswordCorrect(password)
       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
        // Generate JWT token
        
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.message));
        
    }
})
const loggedOutUser = asyncHandler( async ( req, res )=>{
   try {
     await User.findByIdAndUpdate(
         req.user._id,
         {
             $unset: {
                 refreshToken: 1 // this removes the field from document
             }
         },
         {
             new: true
         }
     )
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "User logged Out"))
   } catch (error) {
    return res.status(500).json( new ApiError (500 ,"Something went wrong "))
    
   }
})

export {
    loginUser,
     createUser,
     loggedOutUser

};