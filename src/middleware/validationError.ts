import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { sendResponse } from "../utility/utils";

export const validateBody = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json(
        sendResponse(false, "Bad Request", {
          message: error.details[0].message,
          details: error.details,
        })
      );
      return;
    }
    next();
  };
};
