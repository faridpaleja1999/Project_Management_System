import Jwt from "jsonwebtoken";
import { JWT_KEY } from "../configs/config";
import { UserType } from "../configs/constant";

const key: string = JWT_KEY as string;
export interface InvalidToken {
  auth: boolean;
}
export interface TokenData {
  userId?: any;
  userType?: any;
  data?: any;
}

export interface ITokenBase {
  userId?: number;
  iat?: string;
  userType?: UserType;
  auth?: boolean;
}

export function createToken(
  tokenData: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    const _data = tokenData;
    return Jwt.sign(
      _data,
      key,
      { algorithm: "HS256", expiresIn: "1h" },
      function (err : any , token : any) : any{
        if (err) reject("err");
        return resolve(token as string);
      }
    );
  });
}


export function decodeToken(token: string): Promise<ITokenBase> {
  return new Promise((resolve) => {
    Jwt.verify(token, key, async function (err, decodedData) {
      if (err) {
        return resolve({ ...(decodedData as ITokenBase), auth: false });
      }
      return resolve({ ...(decodedData as ITokenBase), auth: true });
    });
  });
}
