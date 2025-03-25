import { NextFunction, Request, Response } from "express";
import { UserType } from "../configs/constant";
import AppDataSource from "../database/typeormConfig";
import { User } from "../entities/user";
import { decodeToken } from "../utility/token";
import { sendResponse } from "../utility/utils";

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const apiToken = req.headers?.authorization?.split(" ")[1] || "";
    req.user = {} as any;
    if (!apiToken) {
      return res
        .status(401)
        .json(sendResponse(false, "Please provide authorization token", {}));
    }
    const decoded = await decodeToken(apiToken);
    if (!decoded.auth) {
      return res
        .status(401)
        .json(sendResponse(false, "You are not authorised", {}));
    }
    const { userId, userType } = decoded;
    const query = AppDataSource.manager
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: userId });
    const userData = await query.getOne();
    if (!userData) {
      return res
        .status(401)
        .json(sendResponse(false, "You are not authorised", {}));
    }

    req.user = {
      userId: userData?.id as number,
      userType: userData?.userType as unknown as string,
    };
    return next();
  } catch (error) {
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", {}));
  }
}

export function checkUserAccess(...requiredRoles: UserType[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const userRole = req.user?.userType as UserType;
    if (!userRole || !requiredRoles.includes(userRole)) {
      res
        .status(403)
        .json(
          sendResponse(
            false,
            "Forbidden : Sorry.You don't have access for this api.",
            {}
          )
        );
      return;
    }
    return next();
  };
}

export interface UserInterface {
  userId: number;
  userType: string;
}

declare module "express" {
  interface Request {
    user?: UserInterface;
  }
}
