export interface Setting {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  key: string;
  value: any; // jsonb
  updated_at: Date;
}

export interface CreateSettingInput extends Omit<Setting, "id" | "updated_at"> {}
export interface UpdateSettingInput extends Omit<Setting, "id"> {}