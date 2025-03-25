import { Request, Response } from "express";
import AppDataSource from "../database/typeormConfig";
import { AuditLog } from "../entities/audit";
import { paginated, sendResponse, sortedBy } from "../utility/utils";

export const getAllAuditLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { page = 1, perPage = 20, sortBy, sortType } = req.query;
    const paginatedRes = paginated(Number(page), Number(perPage));
    const sortedByRes = sortedBy(sortBy as string, sortType as string);

    const auditRepository = AppDataSource.getRepository(AuditLog);
    const dbQuery = auditRepository.createQueryBuilder("audit");

    //pagination
    dbQuery.offset(paginatedRes.offset).limit(paginatedRes.limit);

    //sorting
    dbQuery.orderBy(`audit.${sortedByRes[0]}`, `${sortedByRes[1]}`);

    //query execution
    const [auditList, auditCount] = await dbQuery.getManyAndCount();

    return res.status(200).json(
      sendResponse(true, "Successfully got the audit log list.", {
        list: auditList,
        count: auditCount,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};
