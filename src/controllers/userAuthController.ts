import { Request, Response } from "express";
import AppDataSource from "../database/typeormConfig";
import { User } from "../entities/user";
import { createToken } from "../utility/token";
import { comparePassword, sendResponse } from "../utility/utils";

export const register = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const existsUserCheck = await userRepo.findOneBy({ email });
    if (existsUserCheck) {
      return res
        .status(409)
        .json(sendResponse(false, "User already exists.", null));
    }
    let userData = userRepo.create({
      name,
      email,
      password,
    });
    userData = await userRepo.save(userData);
    return res
      .status(200)
      .json(sendResponse(true, "Successfully Register.", userData));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const userData = await userRepo.findOne({ where: { email } });
    if (!userData) {
      return res.status(404).json(sendResponse(false, "User not found.", null));
    }
    const passwordCheck = await comparePassword(password, userData?.password);
    if (!passwordCheck) {
      return res.status(400).json(sendResponse(false, "Wrong password.", null));
    }
    const accessToken = await createToken({
      userId: userData.id,
      userType: userData.userType,
    });

    return res.status(200).json(
      sendResponse(true, "Successfully Login.", {
        name: userData.name,
        id: userData.id,
        email: userData.email,
        userType: userData.userType,
        accessToken,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};
