import React, { useEffect, useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { useApi } from "../../../hooks/useApi";
import { DEFAULT_PAGE_SIZE } from "../../../config/constants";
import AnalysisFormModal from "./AnalysisFormModal";
import type { AnalysesResponse, AnalysisItem } from "../../../types/analyses";
import { useNavigate } from "react-router-dom";



type Props = {
  patientId: number;
  canEdit?: boolean;
};

const AnalysesTab: React.FC<Props> = ({ patientId, canEdit = true }) => {
  const { get, del, loading, error } = useApi();
  const navigate = useNavigate();

  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [ordering, setOrdering] = useState<string>("-id");
  const [q, setQ] = useState("");

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AnalysisItem | null>(null);

  const totalPages = useMemo(() => {
    if (!count) return 1;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((a) => a.title?.toLowerCase().includes(term));
  }, [items, q]);

  const fmtDateTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<AnalysesResponse>("/analyses/", {
        params: {
          patient: patientId,
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
      setFetchError(e?.message || "Failed to load analyses.");
    }
  };

  useEffect(() => {
    if (!patientId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, page, pageSize, ordering]);

  const remove = async (a: AnalysisItem) => {
    if (!window.confirm(`Delete analysis "${a.title}"? This cannot be undone.`)) return;
    try {
      await del(`/analyses/${a.id}/`);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to delete analysis.");
    }
  };

  const actionsCell = (a: AnalysisItem) => (
    <div className="d-flex gap-2">
      <Button
        size="sm"
        variant="outline-primary"
        onClick={() => navigate(`/doctor/patients/${patientId}/analyses/${a.id}`)}
      >
        Open
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={() => setEditTarget(a)}
        disabled={!canEdit}
      >
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => void remove(a)}
        disabled={!canEdit}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <>
      <Card className="border-0">
        <Card.Body className="pb-2">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted">Search</Form.Label>
              <Form.Control
                placeholder="Search by title"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                }}
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
                <option value="-id">Newest first</option>
                <option value="id">Oldest first</option>
                <option value="title">Title A–Z</option>
                <option value="-title">Title Z–A</option>
                <option value="-date_created">Created (new→old)</option>
                <option value="date_created">Created (old→new)</option>
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
                className="me-2"
                variant="primary"
                onClick={() => setShowCreate(true)}
                disabled={!canEdit}
              >
                + Add Analysis
              </Button>
              <Button variant="outline-secondary" onClick={() => void load()} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Refresh
                  </>
                ) : (
                  "Refresh"
                )}
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
                <th>Title</th>
                <th>OCR</th>
                <th>Created</th>
                <th>Updated</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !items.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="text-muted">{a.id}</td>
                    <td className="fw-semibold">
                      {a.title}{" "}
                      {a.results_count != null && (
                        <Badge bg="light" text="dark" className="ms-1">
                          {a.results_count} results
                        </Badge>
                      )}
                    </td>
                    <td>{a.ocr_language || "—"}</td>
                    <td>{fmtDateTime(a.date_created)}</td>
                    <td>{fmtDateTime(a.date_last_updated)}</td>
                    <td>{actionsCell(a)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No analyses yet. Click <strong>Add Analysis</strong> to create one.
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

      <AnalysisFormModal
        show={showCreate}
        mode="create"
        patientId={patientId}
        onClose={() => setShowCreate(false)}
        onSaved={() => { setShowCreate(false); void load(); }}
      />
      {editTarget && (
        <AnalysisFormModal
          show={!!editTarget}
          mode="edit"
          analysis={editTarget}
          patientId={patientId}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); void load(); }}
        />
      )}
    </>
  );
};

export default AnalysesTab;
