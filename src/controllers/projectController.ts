import { Request, Response } from "express";
import { Brackets, Not } from "typeorm";
import { AuditAction, AuditEntity, UserType } from "../configs/constant";
import AppDataSource from "../database/typeormConfig";
import { Project } from "../entities/project";
import { Task } from "../entities/task";
import {
  logAuditEntry,
  paginated,
  sendResponse,
  sortedBy,
} from "../utility/utils";

export const getAllProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { search, page = 1, perPage = 2, sortBy, sortType } = req.query;
    const { user } = req;
    const paginatedRes = paginated(Number(page), Number(perPage));
    const sortedByRes = sortedBy(sortBy as string, sortType as string);
    const productRepository = AppDataSource.getRepository(Project);
    const dbQuery = productRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.tasks", "task");
    if (user?.userType === UserType.MANAGER) {
      dbQuery.where("project.createdBy = :userId", { userId: user?.userId });
    } else if (user?.userType === UserType.DEVELOPER) {
      dbQuery.andWhere("task.assigned_to = :userId", { userId: user?.userId });
    }
    if (search) {
      dbQuery.andWhere(
        new Brackets((subQb: any) => {
          subQb.andWhere("project.name LIKE :name", {
            name: `%${search}%`,
          });
        })
      );
    }
    //pagination
    dbQuery.offset(paginatedRes.offset).limit(paginatedRes.limit);

    //sorting
    dbQuery.orderBy(`project.${sortedByRes[0]}`, `${sortedByRes[1]}`);

    //query execution
    const [productList, productCount] = await dbQuery.getManyAndCount();

    return res.status(200).json(
      sendResponse(true, "Successfully got the project list.", {
        list: productList,
        count: productCount,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { user } = req;

    const projectRepository = AppDataSource.getRepository(Project);
    let existsProject = await projectRepository.findOne({
      where: { id: Number(projectId) },
    });
    if (!existsProject) {
      return res
        .status(400)
        .json(sendResponse(false, "Project not found.", null));
    }
    if (
      user?.userType === UserType.MANAGER &&
      existsProject.createdBy != user?.userId
    ) {
      return res
        .status(403)
        .json(
          sendResponse(false, "Access Forbidden to perform view action.", null)
        );
    }
    return res
      .status(200)
      .json(sendResponse(true, "Project fetched successfully.", existsProject));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, description } = req.body;
    const { user } = req;
    const projectRepository = AppDataSource.getRepository(Project);
    const existingProject = await projectRepository.findOne({
      where: { name, createdBy: user?.userId },
    });
    if (existingProject) {
      return res
        .status(400)
        .json(sendResponse(false, "Already project exists.", null));
    }
    let project = projectRepository.create({
      name,
      description,
      createdBy: user?.userId,
    });
    project = await projectRepository.save(project);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.PROJECT,
        AuditAction.CREATE,
        project.createdBy as number,
        project
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Project added successfully.", project));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, description } = req.body;
    const { user } = req;
    const { projectId } = req.params;
    const projectRepository = AppDataSource.getRepository(Project);
    let duplicateProject = await projectRepository.findOne({
      where: { id: Not(Number(projectId)), name },
    });
    if (duplicateProject) {
      return res
        .status(400)
        .json(sendResponse(false, "Project already exists.", null));
    }
    let existingProject = await projectRepository.findOne({
      where: { id: Number(projectId) },
    });
    if (!existingProject) {
      return res
        .status(400)
        .json(sendResponse(false, "Project not found.", null));
    }
    if (
      user?.userType === UserType.MANAGER &&
      existingProject.createdBy != user?.userId
    ) {
      return res
        .status(403)
        .json(
          sendResponse(
            false,
            "Access Forbidden to perform update action.",
            null
          )
        );
    }

    existingProject.name = name;
    existingProject.description = description;
    existingProject.updatedBy = user?.userId ? user?.userId : null;
    existingProject = await projectRepository.save(existingProject);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.PROJECT,
        AuditAction.UPDATE,
        existingProject.updatedBy as number,
        existingProject
      );
    });
    return res
      .status(200)
      .json(
        sendResponse(true, "Project update successfully.", existingProject)
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { user } = req;

    const projectRepository = AppDataSource.getRepository(Project);
    const taskRepository = AppDataSource.getRepository(Task);
    const project = await projectRepository.findOne({
      where: { id: Number(projectId) },
    });
    if (!project) {
      return res
        .status(404)
        .json(sendResponse(false, "Project not found.", null));
    }
    if (
      user?.userType === UserType.MANAGER &&
      project.createdBy != user?.userId
    ) {
      return res
        .status(403)
        .json(
          sendResponse(
            false,
            "Access Forbidden to perform delete action.",
            null
          )
        );
    }
    await taskRepository
      .createQueryBuilder()
      .softDelete()
      .where("project_id = :projectId", { projectId: Number(projectId) })
      .execute();
    await projectRepository.softRemove(project);

    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.PROJECT,
        AuditAction.DELETE,
        user?.userId as number,
        project
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Project deleted successfully.", null));
  } catch (error) {
    console.error("Error deleting project:", error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};
