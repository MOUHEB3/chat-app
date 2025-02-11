import { Request } from "express";
import User from "../database/model/User";
import type { Multer } from "multer";

declare interface ProtectedRequest extends Request {
  user: User;
  // You can now access the user's online status with `user.online`
}

