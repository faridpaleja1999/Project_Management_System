export enum UserType {
  ADMIN = "admin",
  MANAGER = "project_manager",
  DEVELOPER = "developer",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum AuditEntity {
  PROJECT = "project",
  TASK = "task",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export const BCRYPT_HASH_ROUND = 10;
