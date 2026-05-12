export interface StudentDocument {
  id: string; // uuid
  student_id: string; // FK students.id
  type: DocumentType;
  file_url: string;
  uploaded_at: Date;
  verified: boolean;
}

export enum DocumentType {
  BIRTH_CERTIFICATE = "birth_certificate",
  MEDICAL = "medical",
  ID_CARD = "id_card",
  TRANSCRIPT = "transcript",
}

export interface CreateStudentDocumentInput extends Omit<StudentDocument, "id" | "uploaded_at"> {}
export interface UpdateStudentDocumentInput extends Partial<CreateStudentDocumentInput> {}