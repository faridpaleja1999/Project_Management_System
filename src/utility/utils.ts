import bcrypt, { compare } from "bcrypt";
import { AnyARecord } from "dns";
import { AuditAction, AuditEntity } from "../configs/constant";
import AppDataSource from "../database/typeormConfig";
import { AuditLog } from "../entities/audit";

interface Pagination {
  offset: number;
  limit: number;
}

interface ApiResponse<T> {
  msg?: string;
  data: T | null;
  error: T | null;
  success: boolean;
}

type FormatResponse<T> = (
  success: boolean,
  msg: string,
  data: T | null | AnyARecord
) => ApiResponse<T>;

export const hashingString = async (data: string): Promise<string> => {
  return await bcrypt.hash(data, 10);
};

export const comparePassword = (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return compare(password, hashedPassword);
};

export const sendResponse: FormatResponse<unknown> = (
  success = true,
  msg,
  data = null
) => {
  return {
    message: msg,
    success,
    data: success && data ? { ...data } : null,
    error: success == false ? data : null,
  };
};

export const paginated = (page: Number, perPage: Number): Pagination => {
  const limit = Number(perPage) || 20;
  const offset = (Number(page) - 1) * limit;
  return {
    offset,
    limit,
  };
};

export const sortedBy = (
  sortBy = "createdAt",
  sortType = "DESC"
): [string, "ASC" | "DESC"] => {
  const sorttype: "ASC" | "DESC" = sortType == "ASC" ? "ASC" : "DESC";
  return [sortBy, sorttype];
};

export const logAuditEntry = async (
  entity: AuditEntity,
  action: AuditAction,
  changedBy: number,
  details: object = {}
): Promise<void> => {
  try {
    const auditRepository = AppDataSource.getRepository(AuditLog);
    const auditEntry = auditRepository.create({
      entity,
      action,
      changedBy: changedBy,
      changedAt: new Date(),
      createdAt: new Date(),
      details,
    });

    await auditRepository.save(auditEntry);
    console.log(`[AuditLog] ${action} action logged for ${entity}.`);
  } catch (error) {
    console.error("[AuditLog] Error inserting audit log:", error);
  }
};
