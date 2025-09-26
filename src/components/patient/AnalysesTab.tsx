import React, { useEffect, useMemo, useState } from "react";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { useAuth } from "../../auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { DEFAULT_PAGE_SIZE } from "../../config/constants";
import type { PatientItem } from "../../types/patient";
import type { AnalysesResponse, AnalysisItem } from "../../types/analyses";
import type { ResultItem, ResultsResponse } from "../../types/results";
import type { NoteItem, NotesResponse } from "../../types/notes";

const AnalysesTab: React.FC = () => {

  const { user } = useAuth();
  const { get, loading, error } = useApi();

  const patientId = user?.id ?? 0;

  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [aCount, setACount] = useState(0);
  const [aPage, setAPage] = useState(1);

  const [openAnalysisId, setOpenAnalysisId] = useState<number | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [rLoading, setRLoading] = useState(false);
  const [rErr, setRErr] = useState<string | null>(null);



  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");
  const fmtDT = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");


  useEffect(() => {
    if (!patientId) return;

    (async () => {
      try {
        const res = await get<AnalysesResponse>("/analyses/", {
          params: { patient: patientId, page: aPage, page_size: DEFAULT_PAGE_SIZE, ordering: "-id" },
        });
        const list = res.result ?? res.results ?? [];
        const total = res.pagination?.count ?? res.count ?? list.length;
        setAnalyses(list);
        setACount(total);
      } catch {
        console.log('Something wrong happened!');
      }
    })();
  }, [patientId, get, aPage]);


  const openAnalysis = async (aId: number) => {
    if (openAnalysisId === aId) {
      setOpenAnalysisId(null);
      setResults([]);
      return;
    }
    setRErr(null);
    setRLoading(true);
    setOpenAnalysisId(aId);
    try {
      const res = await get<ResultsResponse>("/analyses/results/", {
        params: { analysis: aId, page: 1, page_size: 50, ordering: "-measured_at" },
      });
      const list = res.result ?? res.results ?? [];
      setResults(list);
    } catch (e: any) {
      setRErr(e?.message || "Failed to load results.");
      setResults([]);
    } finally {
      setRLoading(false);
    }
  };

  return (
    <>
      {(error && !analyses.length) && (
        <Alert variant="danger" className="mt-3">{String(error)}</Alert>
      )}
      <div className="table-responsive mt-3">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 70 }}>#</th>
              <th>Title</th>
              <th>OCR</th>
              <th>Created</th>
              <th style={{ width: 120 }}>View</th>
            </tr>
          </thead>
          <tbody>
            {loading && !analyses.length ? (
              <tr>
                <td colSpan={5} className="text-center py-5"><Spinner animation="border" /></td>
              </tr>
            ) : analyses.length ? (
              analyses.map((a) => (
                <React.Fragment key={a.id}>
                  <tr>
                    <td className="text-muted">{a.id}</td>
                    <td className="fw-semibold">{a.title}</td>
                    <td>{a.ocr_language || "—"}</td>
                    <td>{fmtDT(a.date_created)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant={openAnalysisId === a.id ? "secondary" : "outline-primary"}
                        onClick={() => void openAnalysis(a.id)}
                      >
                        {openAnalysisId === a.id ? "Hide" : "View"}
                      </Button>
                    </td>
                  </tr>
                  {openAnalysisId === a.id && (
                    <tr>
                      <td colSpan={5} className="bg-light">
                        {rLoading ? (
                          <div className="py-3 text-center"><Spinner animation="border" /></div>
                        ) : rErr ? (
                          <Alert variant="danger" className="mb-0">{rErr}</Alert>
                        ) : results.length ? (
                          <div className="table-responsive">
                            <Table size="sm" className="mb-0">
                              <thead>
                                <tr>
                                  <th style={{ width: 60 }}>#</th>
                                  <th>Test</th>
                                  <th>Value</th>
                                  <th>Unit</th>
                                  <th>Reference</th>
                                  <th>Measured at</th>
                                </tr>
                              </thead>
                              <tbody>
                                {results.map((r) => (
                                  <tr key={r.id}>
                                    <td className="text-muted">{r.id}</td>
                                    <td>{r.test_name}</td>
                                    <td><Badge bg="light" text="dark">{r.value}</Badge></td>
                                    <td>{r.unit || "—"}</td>
                                    <td>{r.reference_range || "—"}</td>
                                    <td>{fmtDate(r.measured_at)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        ) : (
                          <div className="py-3 text-center text-muted">No results for this analysis.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-5">
                  No analyses yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Simple pager */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="small text-muted">Showing {analyses.length} of {aCount}</div>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setAPage((p) => Math.max(1, p - 1))}
            disabled={aPage === 1 || loading}
          >
            Prev
          </Button>
          <span className="small align-self-center">Page {aPage}</span>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setAPage((p) => p + 1)}
            disabled={analyses.length < DEFAULT_PAGE_SIZE || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )

}

export default AnalysesTab;