export interface Book {
  id: string; // uuid
  isbn?: string; // UNIQUE
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  category?: string;
  total_copies: number;
  available_copies: number;
  cover_url?: string;
  location?: string;
  created_at: Date;
}

export interface CreateBookInput extends Omit<Book, "id" | "created_at"> {}
export interface UpdateBookInput extends Partial<CreateBookInput> {}