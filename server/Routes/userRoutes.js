import express from "express";
import multer from "multer";
import { 
  loginController, 
  registerController, 
  fetchAllUsersController 
} from "../Controllers/userControllers.js";
import protect from "../middleware/authMiddleWare.js";

const Router = express.Router();

const storage = multer.memoryStorage(); // Use memory storage, you can customize this according to your needs
const upload = multer({ storage: storage });

Router.post("/login", loginController);
Router.post("/register", upload.single("image"), registerController);
Router.get("/fetchUsers", protect, fetchAllUsersController);

export default Router;
