import { Request, Response } from "express";
import asyncHandler from "../helpers/asyncHandler";
import userRepo from "../database/repositories/userRepo";
import { AuthFailureError, BadRequestError } from "../core/ApiError";
import { RoleCode } from "../database/model/Role";
import { UserModel } from "../database/model/User";
import User from "../database/model/User";
import bcrypt from "bcrypt";
import { createTokens } from "./auth/authUtils";
import { filterUserData } from "../helpers/utils";
import { SuccessResponse } from "../core/ApiResponse";
import { cookieValidity, environment, tokenInfo } from "../config";
import { emitSocketEvent } from "../helpers/socket";  // Import the emitSocketEvent function


// Extend Express Request type to include `user`
interface AuthenticatedRequest extends Request {
  user?: User;
}

const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const existingUserEmail = await userRepo.findByEmail(email);
  if (existingUserEmail) {
    throw new BadRequestError("email already exists");
  }

  const existingUserUsername = await userRepo.findByUsername(username);
  if (existingUserUsername) {
    throw new BadRequestError("username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // create a new user
  const user = await userRepo.create(
    {
      username,
      email,
      password: hashedPassword,
      avatarUrl: `https://s3bucket.bytenode.xyz/staticbucketstorage/public/images/avatar${
        Math.floor(Math.random() * (40 - 1 + 1)) + 1
      }.avif`,
    } as User,
    RoleCode.USER
  );

  const tokens = await createTokens(user);
  const userData = await filterUserData(user);
  const userDataWithStatus = { ...userData, isOnline: user.isOnline };

  new SuccessResponse("signup successful", {
    user: userDataWithStatus,
    tokens,
  }).send(res);
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { userId, password } = req.body;

  const user = await userRepo.findByEmailOrUsername(userId);
  if (!user) throw new BadRequestError("invalid email/username");

  if (!password) throw new BadRequestError("no credentials provided");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AuthFailureError("Invalid credentials");

  // Update the user's online status
  await UserModel.findByIdAndUpdate(user._id, { isOnline: true });

  const { password: pass, status, ...filteredUser } = user;
  const filteredUserWithStatus = { ...filteredUser, isOnline: true };

  const tokens = await createTokens(user);

  const options = {
    httpOnly: true,
    secure: environment === "production",
  };

  res
    .cookie("accessToken", tokens.accessToken, options)
    .cookie("refreshToken", tokens.refreshToken, options);

  new SuccessResponse("login successful", {
    user: filteredUserWithStatus,
    tokens,
  }).send(res);
});

const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    // Set user's status to offline
    await UserModel.findByIdAndUpdate(req.user._id, { isOnline: false });
  }

  const options = {
    httpOnly: true,
    secure: environment === "production",
  };

  res.clearCookie("accessToken", options).clearCookie("refreshToken", options);

  new SuccessResponse("logout successful", {}).send(res, {});
});

// Update User Status Method
const updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new AuthFailureError("User not authenticated");
  }

  // Validate status
  const validStatuses = ["active", "away", "dnd", "offline"];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError("Invalid status. Allowed values: active, away, dnd, offline");
  }

  // Update the user status
  const user = await userRepo.updateUserStatus(userId.toString(), status);

  // Emit socket event to update status for other users
  if (user) {
    emitSocketEvent(req, userId.toString(), "updateUserStatus", { userId, status });
  }

  // Send success response
  new SuccessResponse("User status updated successfully", user).send(res);
});

export { signUp, login, logout, updateUserStatus };