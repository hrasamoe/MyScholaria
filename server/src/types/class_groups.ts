export interface ClassGroup {
  id: string; // uuid
  class_id: string; // FK classes.id
  name: string;
  type?: string;
  created_at: Date;
}

export interface CreateClassGroupInput extends Omit<ClassGroup, "id" | "created_at"> {}
export interface UpdateClassGroupInput extends Partial<CreateClassGroupInput> {}