import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../../auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { NoteItem, NotesResponse } from "../../types/notes";
import { DEFAULT_PAGE_SIZE } from "../../config/constants";
import { Button, Spinner, Table } from "react-bootstrap";

const NotesTab: React.FC = () => {
  const { user } = useAuth();
  const { get, loading, error } = useApi();

  const patientId = user?.id ?? 0;
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [nCount, setNCount] = useState(0);
  const [nPage, setNPage] = useState(1);

  const fmtDT = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");


  useEffect(() => {
    if (!patientId) return;

    (async () => {
      try {
        const res = await get<NotesResponse>("/notes/", {
          params: { patient: patientId, page: nPage, page_size: DEFAULT_PAGE_SIZE, ordering: "-id" },
        });
        const list = res.result ?? res.results ?? [];
        const total = res.pagination?.count ?? res.count ?? list.length;
        setNotes(list);
        setNCount(total);
      } catch {
        console.log('Something wrong happened!');
      }
    })();
  }, [patientId, get, nPage]);
  return (
    <>
      {(error && !notes.length) && (
        <Alert variant="danger" className="mt-3">{String(error)}</Alert>
      )}
      <div className="table-responsive mt-3">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 70 }}>#</th>
              <th>Title</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && !notes.length ? (
              <tr>
                <td colSpan={4} className="text-center py-5"><Spinner animation="border" /></td>
              </tr>
            ) : notes.length ? (
              notes.map((n, index) => (
                <tr key={n.id}>
                  <td className="text-muted">{++index}</td>
                  <td>
                    <div className="fw-semibold">{n.title}</div>
                    <div className="small text-muted text-truncate" style={{ maxWidth: 520 }}>
                      {n.body}
                    </div>
                  </td>
                  <td>{fmtDT(n.date_created)}</td>
                  <td>{fmtDT(n.date_last_updated)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-5">
                  No notes yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>


      {/* Simple pager */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="small text-muted">Showing {notes.length} of {nCount}</div>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setNPage((p) => Math.max(1, p - 1))}
            disabled={nPage === 1 || loading}
          >
            Prev
          </Button>
          <span className="small align-self-center">Page {nPage}</span>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setNPage((p) => p + 1)}
            disabled={notes.length < DEFAULT_PAGE_SIZE || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )

}

export default NotesTab;