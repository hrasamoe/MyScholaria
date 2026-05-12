export interface RoomReservation {
  id: string; // uuid
  room_id: string; // FK rooms.id
  user_id: string; // FK profiles.id
  start_at: Date;
  end_at: Date;
  purpose?: string;
  status: ReservationStatus;
  created_at: Date;
}

export enum ReservationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export interface CreateRoomReservationInput extends Omit<RoomReservation, "id" | "created_at"> {}
export interface UpdateRoomReservationInput extends Partial<CreateRoomReservationInput> {}