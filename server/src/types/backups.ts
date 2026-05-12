export interface Backup {
  id: string; // uuid
  filename: string;
  size_bytes?: number;
  created_at: Date;
  created_by?: string; // FK users.id
  status: BackupStatus;
}

export enum BackupStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface CreateBackupInput extends Omit<Backup, "id" | "created_at"> {}
export interface UpdateBackupInput extends Partial<CreateBackupInput> {}