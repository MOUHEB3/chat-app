import express, { Request, Response, NextFunction } from "express";
import { login, logout, signUp } from "../controllers/user.controller";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user.validators";
import { validate } from "../validators/validate";

const router = express.Router();

// Register a new user
router.post("/register", userRegisterValidator(), validate, signUp);

// Login a user
router.post("/login", userLoginValidator(), validate, login);

// Logout the user
router.post("/logout", logout);

export default router;
