import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { errors as Err, middlewares as mw } from "@tj-movies-ticket/common/";
import { User } from "../models/user";
import { UserGender } from "@tj-movies-ticket/common/build/enums";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("city").not().isEmpty().withMessage("City must be valid"),
    body("username").not().isEmpty().withMessage("Username must be valid"),
    body("gender")
      .isIn([UserGender.MALE, UserGender.FEMALE, UserGender.OTHER])
      .withMessage("Gender must be valid"),
  ],
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new Err.RequestValidationError(errors.array());
    }

    const { email, password, city, username, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Err.BadRequestError("User already exists");
    }

    const user = User.build({
      email,
      password,
      city: city.toLowerCase(),
      username,
      gender,
    });

    try {
      await user.save();
    } catch (error) {
      console.log(error);
    }

    // Generate jwt
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // store jwt on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
