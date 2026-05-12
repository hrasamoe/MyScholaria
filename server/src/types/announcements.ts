export interface Announcement {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  title: string;
  body: string;
  audience: AnnouncementAudience;
  target_class_id?: string; // FK classes.id
  published_at: Date;
  expires_at?: Date;
  author_id?: string; // FK profiles.id
  created_at: Date;
}

export enum AnnouncementAudience {
  ALL = "all",
  STUDENTS = "students",
  TEACHERS = "teachers",
  STAFF = "staff",
  PARENTS = "parents",
  SPECIFIC_CLASS = "specific_class",
}

export interface CreateAnnouncementInput extends Omit<Announcement, "id" | "created_at"> {}
export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {}