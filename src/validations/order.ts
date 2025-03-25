import Joi from "joi";

const productSchema = Joi.object({
  productId: Joi.number().required(),
  qty: Joi.number().required(),
});

export const orderBodyValidation = Joi.object({
  products: Joi.array().items(productSchema).min(1).required(),
});

export const orderIdValidation = Joi.object({
  orderId: Joi.number().required(),
});

export const orderQueryValidation = Joi.object({
  page: Joi.number().optional(),
  perPage: Joi.number().optional(),
  search: Joi.string().max(500).optional(),
  sortBy: Joi.string().optional(),
  sortType: Joi.string().valid("ASC", "DESC").optional(),
});
