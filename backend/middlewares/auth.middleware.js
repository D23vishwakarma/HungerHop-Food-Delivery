import { ApiError } from "../config/apierror.js";
import { asyncHandler } from "../config/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyAuth = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        throw new ApiError(400, "Unauthorised access");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.userId = user._id;
    next();
});