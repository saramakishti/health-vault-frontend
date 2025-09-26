import React, { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import { useApi } from "../../../hooks/useApi";
import ResultFormModal from "./ResultFormModal";
import type { AnalysisItem } from "../../../types/analyses";
import type { ResultItem, ResultsResponse } from "../../../types/results";

type Props = {
  analysis: AnalysisItem;
  canEdit?: boolean;
  analysisId?: number;
};

const AnalysisPanel: React.FC<Props> = ({ analysis, analysisId, canEdit = true }) => {
  const { get, del, loading, error } = useApi();

  const [items, setItems] = useState<ResultItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState("-measured_at");
  const [q, setQ] = useState("");

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ResultItem | null>(null);

  const totalPages = useMemo(() => {
    if (!count) return 1;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((r) =>
      [r.test_name, r.unit, r.reference_range]
        .filter(Boolean)
        .join(" | ")
        .toLowerCase()
        .includes(term)
    );
  }, [items, q]);

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<ResultsResponse>("/analyses/results/", {
        params: {
          analysis: analysisId,
          page,
          page_size: pageSize,
          ordering,
        },
      });
      const list = res.result ?? res.results ?? [];
      const total = res.pagination?.count ?? res.count ?? list.length;
      setItems(list);
      setCount(total);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to load results.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, page, pageSize, ordering]);

  const remove = async (r: ResultItem) => {
    if (!window.confirm(`Delete result "${r.test_name}"? This cannot be undone.`)) return;
    try {
      await del(`/analyses/results/${r.id}/`);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to delete result.");
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Row className="g-2 align-items-center">
            <Col>
              <div className="d-flex align-items-center gap-2">
                <h2 className="h6 mb-0">{analysis?.result?.title}</h2>
                <Badge bg="light" text="dark">{analysis.result?.ocr_language || "—"}</Badge>
              </div>
              <div className="small text-muted">
                ID #{analysis.result?.id}
                {analysis.result?.date_created ? ` • Created ${new Date(analysis.result?.date_created).toLocaleString()}` : ""}
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="pb-2">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted">Search</Form.Label>
              <Form.Control
                placeholder="Search by test name / unit / reference"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted">Order</Form.Label>
              <Form.Select
                value={ordering}
                onChange={(e) => {
                  setPage(1);
                  setOrdering(e.target.value);
                }}
              >
                <option value="-measured_at">Measured (new→old)</option>
                <option value="measured_at">Measured (old→new)</option>
                <option value="test_name">Test A–Z</option>
                <option value="-test_name">Test Z–A</option>
                <option value="-id">Newest first</option>
                <option value="id">Oldest first</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">Page size</Form.Label>
              <Form.Select
                value={pageSize}
                onChange={(e) => {
                  setPage(1);
                  setPageSize(Number(e.target.value));
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col className="text-md-end">
              <Button
                variant="primary"
                onClick={() => setShowCreate(true)}
              >
                + Add Result
              </Button>
            </Col>
          </Row>
        </Card.Body>

        {(error || fetchError) && (
          <Card.Body className="pt-0">
            <Alert variant="danger" className="mb-0">
              {fetchError || error}
            </Alert>
          </Card.Body>
        )}

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>#</th>
                <th>Test</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Reference</th>
                <th>Measured at</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !items.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="text-muted">{r.id}</td>
                    <td className="fw-semibold">{r.test_name}</td>
                    <td>{r.value}</td>
                    <td>{r.unit || "—"}</td>
                    <td>{r.reference_range || "—"}</td>
                    <td>{fmtDate(r.measured_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditTarget(r)}
                          disabled
                        >
                          Edit
                        </Button> */}
                        {/* <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => void remove(r)}
                          disabled={!canEdit}
                        >
                          Delete
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No results yet. Click <strong>Add Result</strong> to start.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <Card.Footer className="bg-white d-flex justify-content-between">
          <div className="small text-muted">Showing {items.length} of {count}</div>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Prev
            </Button>
            <span className="small align-self-center">Page {page} / {totalPages}</span>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={items.length < pageSize || loading}
            >
              Next
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <ResultFormModal
        show={showCreate}
        mode="create"
        analysisId={analysisId}
        onClose={() => setShowCreate(false)}
        onSaved={() => { setShowCreate(false); void load(); }}
      />
      {editTarget && (
        <ResultFormModal
          show={!!editTarget}
          mode="edit"
          analysisId={analysisId}
          result={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); void load(); }}
        />
      )}
    </>
  );
};

export default AnalysisPanel;
