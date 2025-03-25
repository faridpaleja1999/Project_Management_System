import Joi from "joi";

export const categoryBodyValidation = Joi.object({
  name: Joi.string().alphanum().max(255).required(),
  image: Joi.string().alphanum().max(255).required(),
  desc: Joi.string().alphanum().max(255).required(),
});

export const categoryIdValidation = Joi.object({
  id: Joi.number().required(),
});
