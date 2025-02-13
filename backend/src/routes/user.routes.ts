import express, { Request, Response, NextFunction } from "express";
import { login, logout, signUp, updateUserStatus } from "../controllers/user.controller";  // <-- Import the new function
import {
  userLoginValidator,
  userRegisterValidator,
  updateStatusValidator,  // <-- Import validator for status
} from "../validators/user.validators";
import { validate } from "../validators/validate";

const router = express.Router();

// Register a new user
router.post("/register", userRegisterValidator(), validate, signUp);

// Login a user
router.post("/login", userLoginValidator(), validate, login);

// Logout the user
router.post("/logout", logout);

// New route to update user status
router.put("/update-status", updateStatusValidator(), validate, updateUserStatus);  // <-- Added the new route

export default router;
