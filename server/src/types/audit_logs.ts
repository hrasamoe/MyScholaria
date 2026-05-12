export interface AuditLog {
  id: string; // uuid
  user_id?: string; // FK users.id
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata: any; // jsonb
  ip_address?: string;
  created_at: Date;
}

export interface CreateAuditLogInput extends Omit<AuditLog, "id" | "created_at"> {}