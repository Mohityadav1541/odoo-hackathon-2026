import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OTPhtml,generateOTP } from "../utils/email.js";
import sendEmail from "../services/email.js";

// import transporter from "../config/mailer.js"; // Optional if mailer isn't fully set up yet


// =====================================================
// SIGN UP
// =====================================================

const signup = async (req, res) => {
    try {

        const {
            employeeId,
            email,
            password,
            role
        } = req.body;


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!employeeId || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, email and password are required"
            });
        }


        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }


        // ---------------------------------------------
        // CHECK EMPLOYEE ID
        // ---------------------------------------------

        const existingEmployeeId = await prisma.user.findUnique({
            where: {
                employeeId
            }
        });


        if (existingEmployeeId) {
            return res.status(409).json({
                success: false,
                message: "Employee ID already exists"
            });
        }


        // ---------------------------------------------
        // CHECK EMAIL
        // ---------------------------------------------

        const existingEmail = await prisma.user.findUnique({
            where: {
                email
            }
        });


        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }


        // ---------------------------------------------
        // HASH PASSWORD
        // ---------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ---------------------------------------------
        // GENERATE VERIFICATION TOKEN
        // ---------------------------------------------

        const otp = generateOTP();
        const verificationToken = otp

        const otpHtml = OTPhtml(otp);


        // Token expires after 24 hours

        const verificationTokenExpiry = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );


        // ---------------------------------------------
        // ROLE
        // ---------------------------------------------

        // Public signup should normally create EMPLOYEE.
        // ADMIN/HR creation should later be restricted.

        const userRole = role || "EMPLOYEE";


        // ---------------------------------------------
        // CREATE USER
        // ---------------------------------------------

        const user = await prisma.user.create({
            data: {
                employeeId,
                email,
                password: hashedPassword,

                role: userRole,

                emailVerified: false,

                verificationToken
            }
        });


        // ---------------------------------------------
        // CREATE VERIFICATION LINK
        // ---------------------------------------------

        const verificationLink =
            `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;


        // ---------------------------------------------
        // SEND EMAIL
        // ---------------------------------------------
        await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, otpHtml);


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully. Please verify your email.",

            user: {
                id: user.id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error("SIGNUP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account"
        });
    }
};



// =====================================================
// VERIFY EMAIL
// =====================================================

const verifyEmail = async (req, res) => {

    try {

        const { token } = req.params;


        // ---------------------------------------------
        // CHECK TOKEN
        // ---------------------------------------------

        if (!token) {

            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });

        }


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token
            }
        });


        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid verification token"
            });

        }


        // ---------------------------------------------
        // ALREADY VERIFIED
        // ---------------------------------------------

        if (user.emailVerified) {

            return res.status(200).json({
                success: true,
                message: "Email is already verified"
            });

        }


        // ---------------------------------------------
        // VERIFY USER
        // ---------------------------------------------

        await prisma.user.update({

            where: {
                id: user.id
            },

            data: {

                emailVerified: true,

                // Remove token after successful verification
                verificationToken: null

            }

        });


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Email verified successfully. You can now login."

        });

    } catch (error) {

        console.error("EMAIL VERIFICATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify email"
        });

    }
};



// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {

    try {

        const {
            email,
            employeeId,
            password
        } = req.body;

        const loginId = email || employeeId;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!loginId || !password) {

            return res.status(400).json({
                success: false,
                message: "Email/Employee ID and password are required"
            });

        }


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginId },
                    { employeeId: loginId }
                ]
            }
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // ---------------------------------------------
        // CHECK PASSWORD
        // ---------------------------------------------

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // ---------------------------------------------
        // CHECK EMAIL VERIFICATION
        // ---------------------------------------------

        if (!user.emailVerified) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in"

            });

        }


        // ---------------------------------------------
        // CREATE JWT
        // ---------------------------------------------

        const token = jwt.sign(

            {
                userId: user.id,
                employeeId: user.employeeId,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {

                id: user.id,

                employeeId: user.employeeId,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login"
        });

    }

};



export {
    signup,
    verifyEmail,
    login
};