-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  google_id text UNIQUE,
  github_id text UNIQUE,
  avatar_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_banned boolean NOT NULL DEFAULT false,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone,
  verify_token text,
  verify_expires timestamp with time zone,
  reset_token text,
  reset_expires timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  terms_accepted boolean DEFAULT false,
  privacy_policy_accepted boolean DEFAULT false,
  consent_date timestamp with time zone,
  marketing_consent boolean DEFAULT false,
  pending_establishment_id text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.refresh_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  device_info text,
  ip_address inet,
  expires_at timestamp with time zone NOT NULL,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.oauth_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider USER-DEFINED NOT NULL,
  provider_id text NOT NULL,
  access_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text,
  phone text,
  address text,
  date_of_birth date,
  gender USER-DEFINED,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text,
  last_name text,
  user_id uuid UNIQUE,
  email text,
  profession text,
  profile_statut USER-DEFINED,
  establishment_id uuid,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT profiles_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.establishments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type USER-DEFINED NOT NULL DEFAULT 'other'::establishment_type_enum,
  address text,
  phone text,
  email text,
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  identification_number text UNIQUE,
  join_code text,
  join_code_hash text,
  admin_code text,
  admin_code_hash text,
  is_active boolean NOT NULL DEFAULT true,
  owner_id uuid,
  city text NOT NULL,
  zip_code numeric,
  CONSTRAINT establishments_pkey PRIMARY KEY (id),
  CONSTRAINT establishments_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  establishment_id uuid NOT NULL,
  position USER-DEFINED,
  department USER-DEFINED,
  hire_date date,
  contract_type USER-DEFINED,
  salary numeric CHECK (salary IS NULL OR salary >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  statut USER-DEFINED DEFAULT 'active'::staff_statut,
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT staff_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  establishment_id uuid NOT NULL,
  employee_number text NOT NULL UNIQUE,
  specialization USER-DEFINED DEFAULT 'Malagasy'::subject_type,
  hire_date date,
  contract_type USER-DEFINED,
  hourly_rate numeric CHECK (hourly_rate IS NULL OR hourly_rate >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  account_id uuid,
  qualification text,
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT teachers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT teachers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.users(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  name text NOT NULL,
  level text,
  academic_year text NOT NULL,
  main_teacher_id uuid,
  capacity integer,
  room_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT classes_main_teacher_id_fkey FOREIGN KEY (main_teacher_id) REFERENCES public.teachers(id),
  CONSTRAINT classes_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE,
  establishment_id uuid NOT NULL,
  student_number text NOT NULL UNIQUE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  class_id uuid,
  status USER-DEFINED NOT NULL DEFAULT 'active'::student_status_enum,
  medical_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT students_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['birth_certificate'::text, 'medical'::text, 'id_card'::text, 'transcript'::text])),
  file_url text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  CONSTRAINT student_documents_pkey PRIMARY KEY (id),
  CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.staff_absences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  type USER-DEFINED,
  approved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT staff_absences_pkey PRIMARY KEY (id),
  CONSTRAINT staff_absences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT staff_absences_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.class_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  name text NOT NULL,
  type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_groups_pkey PRIMARY KEY (id),
  CONSTRAINT class_groups_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.room_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT room_reservations_pkey PRIMARY KEY (id),
  CONSTRAINT room_reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.school_calendar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT school_calendar_pkey PRIMARY KEY (id),
  CONSTRAINT school_calendar_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  level text,
  coefficient numeric NOT NULL DEFAULT 1.0,
  hours_per_week integer,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  cycle USER-DEFINED NOT NULL,
  duration_years integer NOT NULL DEFAULT 3,
  total_ects integer,
  head_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_head_id_fkey FOREIGN KEY (head_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.program_subjects (
  program_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  semester integer NOT NULL,
  ects integer,
  mandatory boolean NOT NULL DEFAULT true,
  CONSTRAINT program_subjects_pkey PRIMARY KEY (program_id, subject_id, semester),
  CONSTRAINT program_subjects_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT program_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.class_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid,
  weekly_hours integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT class_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT class_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.timetable (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid,
  room_id uuid,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  week_type USER-DEFINED NOT NULL DEFAULT 'all'::week_type_enum,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT timetable_pkey PRIMARY KEY (id),
  CONSTRAINT timetable_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT timetable_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT timetable_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.coursebook (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_subject_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  topic text NOT NULL,
  content text,
  homework text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coursebook_pkey PRIMARY KEY (id),
  CONSTRAINT coursebook_class_subject_id_fkey FOREIGN KEY (class_subject_id) REFERENCES public.class_subjects(id),
  CONSTRAINT coursebook_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.homework_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_subject_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT homework_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT homework_assignments_class_subject_id_fkey FOREIGN KEY (class_subject_id) REFERENCES public.class_subjects(id)
);
CREATE TABLE public.homework_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  file_url text,
  grade numeric CHECK (grade IS NULL OR grade >= 0::numeric AND grade <= 20::numeric),
  feedback text,
  CONSTRAINT homework_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT homework_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.homework_assignments(id),
  CONSTRAINT homework_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.internships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  company_name text NOT NULL,
  tutor_name text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  topic text,
  mentor_teacher_id uuid,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  final_grade numeric CHECK (final_grade IS NULL OR final_grade >= 0::numeric AND final_grade <= 20::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT internships_pkey PRIMARY KEY (id),
  CONSTRAINT internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT internships_mentor_teacher_id_fkey FOREIGN KEY (mentor_teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_subject_id uuid NOT NULL,
  title text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'test'::exam_type_enum,
  date date NOT NULL,
  duration_minutes integer,
  room_id uuid,
  coefficient numeric NOT NULL DEFAULT 1.0,
  max_score numeric NOT NULL DEFAULT 20,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_class_subject_id_fkey FOREIGN KEY (class_subject_id) REFERENCES public.class_subjects(id)
);
CREATE TABLE public.grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  exam_id uuid NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric AND score <= 20::numeric),
  comment text,
  graded_by uuid,
  graded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grades_pkey PRIMARY KEY (id),
  CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT grades_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT grades_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.report_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  period USER-DEFINED NOT NULL,
  academic_year text NOT NULL,
  average numeric,
  rank integer,
  decision text,
  pdf_url text,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT report_cards_pkey PRIMARY KEY (id),
  CONSTRAINT report_cards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.report_card_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_card_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  average numeric,
  class_average numeric,
  coefficient numeric NOT NULL DEFAULT 1.0,
  teacher_comment text,
  CONSTRAINT report_card_lines_pkey PRIMARY KEY (id),
  CONSTRAINT report_card_lines_report_card_id_fkey FOREIGN KEY (report_card_id) REFERENCES public.report_cards(id),
  CONSTRAINT report_card_lines_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  class_subject_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status USER-DEFINED NOT NULL DEFAULT 'present'::attendance_status_enum,
  recorded_by uuid,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT attendance_class_subject_id_fkey FOREIGN KEY (class_subject_id) REFERENCES public.class_subjects(id),
  CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.disciplinary_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  reason text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  decided_by uuid,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT disciplinary_actions_pkey PRIMARY KEY (id),
  CONSTRAINT disciplinary_actions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT disciplinary_actions_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.duty_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  date date NOT NULL,
  time_slot text NOT NULL,
  location text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT duty_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT duty_schedule_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);
CREATE TABLE public.fee_structures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  name text NOT NULL,
  level text,
  academic_year text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  frequency USER-DEFINED NOT NULL DEFAULT 'annual'::fee_frequency_enum,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fee_structures_pkey PRIMARY KEY (id),
  CONSTRAINT fee_structures_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  invoice_number text NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0::numeric),
  tax numeric NOT NULL DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::invoice_status_enum,
  pdf_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.invoice_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total numeric DEFAULT ((quantity)::numeric * unit_price),
  CONSTRAINT invoice_lines_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_lines_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  student_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  method USER-DEFINED NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  reference text,
  received_by uuid,
  receipt_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id),
  CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT payments_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.scholarships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  academic_year text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::scholarship_status_enum,
  decision_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scholarships_pkey PRIMARY KEY (id),
  CONSTRAINT scholarships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.budget_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT budget_entries_pkey PRIMARY KEY (id),
  CONSTRAINT budget_entries_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT budget_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  location text,
  type text,
  capacity integer,
  cover_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.event_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  instructor text,
  max_participants integer,
  CONSTRAINT event_activities_pkey PRIMARY KEY (id),
  CONSTRAINT event_activities_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0::numeric),
  mandatory boolean NOT NULL DEFAULT false,
  CONSTRAINT event_fees_pkey PRIMARY KEY (id),
  CONSTRAINT event_fees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  student_id uuid NOT NULL,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'waived'::text])),
  attended boolean NOT NULL DEFAULT false,
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  isbn text UNIQUE,
  title text NOT NULL,
  author text,
  publisher text,
  year integer,
  category text,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  cover_url text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT books_pkey PRIMARY KEY (id)
);
CREATE TABLE public.book_loans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  borrower_id uuid NOT NULL,
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  return_date date,
  status USER-DEFINED NOT NULL DEFAULT 'active'::loan_status_enum,
  fine_amount numeric NOT NULL DEFAULT 0 CHECK (fine_amount >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT book_loans_pkey PRIMARY KEY (id),
  CONSTRAINT book_loans_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id),
  CONSTRAINT book_loans_borrower_id_fkey FOREIGN KEY (borrower_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamp with time zone,
  send_at timestamp with time zone NOT NULL DEFAULT now(),
  is_edited boolean DEFAULT false,
  deleted_by_receiver boolean DEFAULT false,
  deleted boolean NOT NULL DEFAULT false,
  reply_id uuid,
  deleted_by_sender boolean NOT NULL DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_recipient_id_fkey1 FOREIGN KEY (recipient_id) REFERENCES public.users(id),
  CONSTRAINT messages_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.messages(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  audience USER-DEFINED NOT NULL DEFAULT 'all'::user_role,
  expires_at timestamp with time zone,
  author_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.theses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  title text NOT NULL,
  cycle USER-DEFINED NOT NULL,
  supervisor_id uuid,
  co_supervisor_id uuid,
  start_date date NOT NULL,
  defense_date date,
  status USER-DEFINED NOT NULL DEFAULT 'in_progress'::thesis_status_enum,
  final_grade numeric CHECK (final_grade IS NULL OR final_grade >= 0::numeric AND final_grade <= 20::numeric),
  pdf_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT theses_pkey PRIMARY KEY (id),
  CONSTRAINT theses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT theses_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.teachers(id),
  CONSTRAINT theses_co_supervisor_id_fkey FOREIGN KEY (co_supervisor_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.diplomas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  program_id uuid NOT NULL,
  serial_number text NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  mention text,
  pdf_url text,
  signed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT diplomas_pkey PRIMARY KEY (id),
  CONSTRAINT diplomas_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT diplomas_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT diplomas_signed_by_fkey FOREIGN KEY (signed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.backups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  size_bytes bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])),
  CONSTRAINT backups_pkey PRIMARY KEY (id),
  CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  plan_type text NOT NULL CHECK (plan_type = ANY (ARRAY['free'::text, 'basic'::text, 'pro'::text, 'premium'::text])),
  status text NOT NULL DEFAULT 'active'::text,
  current_period_start timestamp with time zone NOT NULL DEFAULT now(),
  current_period_end timestamp with time zone NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.establishment_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_name USER-DEFINED NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  is_aproved boolean DEFAULT false,
  CONSTRAINT establishment_members_pkey PRIMARY KEY (id),
  CONSTRAINT establishment_members_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT establishment_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.school_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  academic_year text NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT school_periods_pkey PRIMARY KEY (id),
  CONSTRAINT school_periods_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.student_parents (
  student_id uuid NOT NULL,
  parent_profile_id uuid NOT NULL,
  is_emergency_contact boolean DEFAULT false,
  has_legal_custody boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_parents_pkey PRIMARY KEY (student_id, parent_profile_id),
  CONSTRAINT student_parents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_parents_parent_profile_id_fkey FOREIGN KEY (parent_profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  email text,
  token text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student'::text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  used_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT invitations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  name text NOT NULL,
  type USER-DEFINED DEFAULT 'Standard Classroom'::room_tyoe,
  capacity integer,
  equipment text NOT NULL DEFAULT 'V'::text,
  building text DEFAULT ' '::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id)
);
CREATE TABLE public.announcement_targets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  announcement_id uuid,
  user_id uuid,
  CONSTRAINT announcement_targets_pkey PRIMARY KEY (id),
  CONSTRAINT announcement_targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT announcement_targets_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL,
  author_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying NOT NULL,
  audience USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_establishment_id_fkey FOREIGN KEY (establishment_id) REFERENCES public.establishments(id),
  CONSTRAINT notifications_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.notification_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  CONSTRAINT notification_receipts_pkey PRIMARY KEY (id),
  CONSTRAINT notification_receipts_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id),
  CONSTRAINT notification_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);