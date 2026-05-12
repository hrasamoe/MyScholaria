export interface Class {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  name: string;
  level?: string;
  academic_year: string;
  main_teacher_id?: string; // FK teachers.id
  capacity?: number;
  room_id?: string; // FK rooms.id
  created_at: Date;
  updated_at: Date;
}

export interface CreateClassInput extends Omit<Class, "id" | "created_at" | "updated_at"> {}
export interface UpdateClassInput extends Partial<CreateClassInput> {}