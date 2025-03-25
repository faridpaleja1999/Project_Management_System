import { Request, Response } from "express";
import { Brackets, Not } from "typeorm";
import { AuditAction, AuditEntity, UserType } from "../configs/constant";
import AppDataSource from "../database/typeormConfig";
import { Task } from "../entities/task";
import {
  logAuditEntry,
  paginated,
  sendResponse,
  sortedBy,
} from "../utility/utils";

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      search,
      page = 1,
      perPage = 20,
      sortBy,
      sortType,
      filterByStatus,
      filterByPriority,
    } = req.query;
    const { user } = req;
    const paginatedRes = paginated(Number(page), Number(perPage));
    const sortedByRes = sortedBy(sortBy as string, sortType as string);

    const taskRepository = AppDataSource.getRepository(Task);
    const dbQuery = taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project");
    if (user?.userType == UserType.MANAGER) {
      dbQuery.where("project.createdBy = :userId", { userId: user?.userId });
    }
    if (user?.userType == UserType.DEVELOPER) {
      dbQuery.where("task.assigned_to = :userId", { userId: user?.userId });
    }
    if (filterByStatus) {
      dbQuery.where("task.status = :filterByStatus", { filterByStatus });
    }
    if (filterByPriority) {
      dbQuery.where("task.priority = :filterByPriority", { filterByPriority });
    }
    if (search) {
      dbQuery.andWhere(
        new Brackets((subQb: any) => {
          subQb.andWhere("title LIKE :title", {
            title: `%${search}%`,
          });
        })
      );
    }
    //pagination
    dbQuery.offset(paginatedRes.offset).limit(paginatedRes.limit);

    //sorting
    dbQuery.orderBy(`task.${sortedByRes[0]}`, `${sortedByRes[1]}`);

    //query execution
    const [taskList, taskCount] = await dbQuery.getManyAndCount();

    return res.status(200).json(
      sendResponse(true, "Successfully got the task list.", {
        list: taskList,
        count: taskCount,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { taskId } = req.params;
    const { user } = req;
    const taskRepository = AppDataSource.getRepository(Task);
    let existTask = await taskRepository.findOne({
      where: { id: Number(taskId) },
      relations: ["project"],
    });
    if (!existTask) {
      return res.status(400).json(sendResponse(false, "Task not found.", null));
    }
    if (
      (user?.userType === UserType.DEVELOPER &&
        existTask.assigned_to != user?.userId) ||
      (user?.userType === UserType.MANAGER &&
        existTask.project.createdBy != user?.userId)
    ) {
      return res
        .status(403)
        .json(
          sendResponse(
            false,
            "Access Forbidden to perform view this task.",
            null
          )
        );
    }
    return res
      .status(200)
      .json(sendResponse(true, "Task fetched successfully.", existTask));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, project_id, priority, assigned_to } = req.body;
    const { user } = req;
    const taskRepository = AppDataSource.getRepository(Task);
    const existingTask = await taskRepository.findOne({
      where: { title, createdBy: user?.userId, project: { id: project_id } },
    });
    if (existingTask) {
      return res
        .status(400)
        .json(sendResponse(false, "Already task exists.", null));
    }
    let task = taskRepository.create({
      title,
      description,
      priority,
      createdBy: user?.userId,
      project: { id: project_id },
      assigned_to: assigned_to ? assigned_to : null,
    });
    task = await taskRepository.save(task);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.TASK,
        AuditAction.CREATE,
        user?.userId as number,
        task
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Task added successfully.", task));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const updateTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, status, priority, assigned_to } = req.body;
    const { user } = req;
    const { taskId } = req.params;
    const taskRepository = AppDataSource.getRepository(Task);
    let duplicateTask = await taskRepository.findOne({
      where: { id: Not(Number(taskId)), title },
    });
    if (duplicateTask) {
      return res
        .status(400)
        .json(sendResponse(false, "Task already exists.", null));
    }
    let existingTask = await taskRepository.findOne({
      where: { id: Number(taskId) },
    });
    if (!existingTask) {
      return res.status(400).json(sendResponse(false, "Task not found.", null));
    }
    if (
      (user?.userType === UserType.DEVELOPER &&
        existingTask.assigned_to != user?.userId) ||
      (user?.userType === UserType.MANAGER &&
        existingTask.project.createdBy != user?.userId)
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
    existingTask.title = title;
    existingTask.description = description;

    if (status && existingTask.status !== status) {
      existingTask.status = status;
    }
    if (priority && existingTask.priority !== priority) {
      existingTask.priority = priority;
    }
    if (assigned_to && existingTask.assigned_to !== assigned_to) {
      existingTask.assigned_to = assigned_to;
    }
    existingTask.updatedBy = user?.userId ? user?.userId : null;
    existingTask = await taskRepository.save(existingTask);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.TASK,
        AuditAction.UPDATE,
        user?.userId as number,
        existingTask
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Task update successfully.", existingTask));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const updateStatusTask = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { status, priority, assigned_to } = req.body;
    const { user } = req;
    const { taskId } = req.params;
    const taskRepository = AppDataSource.getRepository(Task);
    let existingTask = await taskRepository.findOne({
      where: { id: Number(taskId) },
      relations: ["project"],
    });
    if (!existingTask) {
      return res.status(400).json(sendResponse(false, "Task not found.", null));
    }
    if (
      (user?.userType === UserType.DEVELOPER &&
        existingTask.assigned_to != user?.userId) ||
      (user?.userType === UserType.MANAGER &&
        existingTask.project.createdBy != user?.userId)
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

    if (status && existingTask.status !== status) {
      existingTask.status = status;
    }
    if (priority && existingTask.priority !== priority) {
      existingTask.priority = priority;
    }
    if (assigned_to && existingTask.assigned_to !== assigned_to) {
      existingTask.assigned_to = assigned_to;
    }
    existingTask.updatedBy = user?.userId ? user?.userId : null;
    existingTask = await taskRepository.save(existingTask);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.TASK,
        AuditAction.UPDATE,
        user?.userId as number,
        existingTask
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Task update successfully.", existingTask));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { taskId } = req.params;
    const { user } = req;

    const taskRepository = AppDataSource.getRepository(Task);

    const task = await taskRepository.findOne({
      where: { id: Number(taskId) },
      relations: ["project"],
    });
    if (!task) {
      return res.status(404).json(sendResponse(false, "Task not found.", null));
    }
    if (
      user?.userType == UserType.MANAGER &&
      user.userId != task.project.createdBy
    ) {
      return res
        .status(403)
        .json(sendResponse(false, "You can not delete this task.", null));
    }

    await taskRepository.softRemove(task);
    queueMicrotask(() => {
      logAuditEntry(
        AuditEntity.TASK,
        AuditAction.DELETE,
        user?.userId as number,
        task
      );
    });
    return res
      .status(200)
      .json(sendResponse(true, "Task deleted successfully.", null));
  } catch (error) {
    console.error("Error deleting task:", error);
    return res
      .status(500)
      .json(sendResponse(false, "Something went wrong.", null));
  }
};
