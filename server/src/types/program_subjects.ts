export interface ProgramSubject {
  program_id: string; // FK programs.id
  subject_id: string; // FK subjects.id
  semester: number;
  ects?: number;
  mandatory: boolean;
}

export interface CreateProgramSubjectInput extends ProgramSubject {}
export interface UpdateProgramSubjectInput extends Partial<CreateProgramSubjectInput> {}