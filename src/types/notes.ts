export type NoteItem = {
  id: number;
  patient: number | { id: number };
  doctor: number | { id: number };
  title: string;
  body: string;
  date_created?: string;
  date_last_updated?: string;
};

export type NotesResponse = {
  result?: NoteItem[];
  results?: NoteItem[];
  pagination?: { count?: number; num_pages?: number };
  count?: number;
};