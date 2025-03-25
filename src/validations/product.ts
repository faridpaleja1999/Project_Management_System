import Joi from "joi";

export const productBodyValidation = Joi.object({
  name: Joi.string().alphanum().max(255).required(),
  image: Joi.string().alphanum().max(255).required(),
  desc: Joi.string().alphanum().max(255).required(),
  countInStock: Joi.number().min(1).required(),
  discount: Joi.number().min(0).max(100).required(),
  price: Joi.number().required(),
  categoryId: Joi.number().required(),
});

export const productQtyValidation = Joi.object({
  countInStock: Joi.number().greater(0).required(),
  operation: Joi.valid("add", "remove").required(),
});

export const productIdValidation = Joi.object({
  id: Joi.number().required(),
});

export const productQueryValidation = Joi.object({
  categoryId: Joi.number().optional(),
  page: Joi.number().optional(),
  perPage: Joi.number().optional(),
  search: Joi.string().max(500).optional(),
  sortBy: Joi.string().optional(),
  sortType: Joi.string().valid("ASC", "DESC").optional(),
});
