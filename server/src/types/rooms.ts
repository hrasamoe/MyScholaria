export interface Room {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  name: string;
  type?: string;
  capacity?: number;
  equipment: any[]; // jsonb
  floor?: number;
  created_at: Date;
}

export interface CreateRoomInput extends Omit<Room, "id" | "created_at"> {}
export interface UpdateRoomInput extends Partial<CreateRoomInput> {}