export type ResultItem = {
  id: number;
  analysis: number | { id: number };
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  measured_at?: string;
  date_created?: string;
  date_last_updated?: string;
};

export type ResultsResponse = {
  result?: ResultItem[];
  results?: ResultItem[];
  pagination?: { count?: number; num_pages?: number };
  count?: number;
};