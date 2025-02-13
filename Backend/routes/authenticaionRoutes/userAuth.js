import express from "express";
import { registerPatient, registerTherapist, Login } from "../../controller/authentication/userAuth.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/therapistSignup:
 *   post:
 *     summary: Register a new therapist
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secretpassword
 *               specialization:
 *                 type: string
 *                 example: Clinical Psychology
 *               certificate:
 *                 type: string
 *                 example: link-to-certificate.pdf
 *     responses:
 *       200:
 *         description: Therapist registered successfully
 *       500:
 *         description: Internal server error
 */
router.post("/therapistSignup", registerTherapist);

/**
 * @swagger
 * /api/user/Login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secretpassword
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing or invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/Login", Login);

/**
 * @swagger
 * /api/user/PatientSignup:
 *   post:
 *     summary: Register a new patient
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 example: janesmith@example.com
 *               password:
 *                 type: string
 *                 example: secretpassword
 *               collage:
 *                 type: string
 *                 example: XYZ University
 *     responses:
 *       200:
 *         description: Patient registered successfully
 *       500:
 *         description: Internal server error
 */
router.post("/PatientSignup", registerPatient);

export default router;
