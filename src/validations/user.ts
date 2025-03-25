import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().alphanum().max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(16).required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(16).required(),
});
