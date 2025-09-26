import React, { useEffect, useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useApi } from "../../../hooks/useApi";
import { DEFAULT_PAGE_SIZE } from "../../../config/constants";
import NoteFormModal from "./NoteFormModal";
import type { NoteItem, NotesResponse } from "../../../types/notes";

type Props = {
  patientId: number;
  doctorId?: number;
};

const NotesTab: React.FC<Props> = ({ patientId, doctorId }) => {
  const { get, del, loading, error } = useApi();

  const [items, setItems] = useState<NoteItem[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [ordering, setOrdering] = useState<string>("-id");
  const [q, setQ] = useState("");

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<NoteItem | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((count || 1) / pageSize)), [count, pageSize]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((n) =>
      [n.title, n.body].filter(Boolean).join(" ").toLowerCase().includes(term)
    );
  }, [items, q]);

  const fmtDT = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<NotesResponse>("/notes/", {
        params: {
          patient: patientId,
          doctor: doctorId || undefined,
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
      setFetchError(e?.message || "Failed to load notes.");
    }
  };

  useEffect(() => {
    if (!patientId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, doctorId, page, pageSize, ordering]);

  const remove = async (n: NoteItem) => {
    if (!window.confirm(`Delete note "${n.title}"? This cannot be undone.`)) return;
    try {
      await del(`/notes/${n.id}/`);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to delete note.");
    }
  };

  return (
    <>
      <Card className="border-0">
        <Card.Body className="pb-2">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted">Search</Form.Label>
              <Form.Control
                placeholder="Search title or body"
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
                <option value="-id">Newest first</option>
                <option value="id">Oldest first</option>
                <option value="-date_created">Created (new→old)</option>
                <option value="date_created">Created (old→new)</option>
                <option value="title">Title A–Z</option>
                <option value="-title">Title Z–A</option>
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
              <Button className="me-2" variant="primary" onClick={() => setShowCreate(true)}>
                + Add Note
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
                <th>Created</th>
                <th>Updated</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !items.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((n) => (
                  <tr key={n.id}>
                    <td className="text-muted">{n.id}</td>
                    <td className="fw-semibold">
                      {n.title}
                      <div className="small text-muted text-truncate" style={{ maxWidth: 420 }}>
                        {n.body}
                      </div>
                    </td>
                    <td>{fmtDT(n.date_created)}</td>
                    <td>{fmtDT(n.date_last_updated)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => setEditTarget(n)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => void remove(n)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-5">
                    No notes yet. Click <strong>Add Note</strong> to create one.
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

      <NoteFormModal
        show={showCreate}
        mode="create"
        patientId={patientId}
        doctorId={doctorId}
        onClose={() => setShowCreate(false)}
        onSaved={() => { setShowCreate(false); void load(); }}
      />
      {editTarget && (
        <NoteFormModal
          show={!!editTarget}
          mode="edit"
          patientId={patientId}
          doctorId={doctorId}
          note={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); void load(); }}
        />
      )}
    </>
  );
};

export default NotesTab;
