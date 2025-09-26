export type AnalysisItem = {
  id: number;
  patient: number | { id: number };
  title: string;
  ocr_language?: string;
  date_created?: string;
  date_last_updated?: string;
  results_count?: number;
  result?: any;
};

export type AnalysesResponse = {
  result?: AnalysisItem[];
  results?: AnalysisItem[];
  pagination?: { count?: number; num_pages?: number };
  count?: number;
};