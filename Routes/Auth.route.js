import express from "express";
import { loginUser, registerUser } from "../Controllers/Auth.Controller.js";
const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)


export default router;