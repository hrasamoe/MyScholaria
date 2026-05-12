export interface StudentParent {
  student_id: string; // FK students.id
  parent_profile_id: string; // FK profiles.id
  relationship_type: RelationshipType;
  is_emergency_contact: boolean;
  has_legal_custody: boolean;
  created_at: Date;
}

export enum RelationshipType {
  FATHER = "father",
  MOTHER = "mother",
  GUARDIAN = "guardian",
  OTHER = "other",
}

export interface CreateStudentParentInput extends Omit<StudentParent, "created_at"> {}
export interface UpdateStudentParentInput extends Partial<CreateStudentParentInput> {}