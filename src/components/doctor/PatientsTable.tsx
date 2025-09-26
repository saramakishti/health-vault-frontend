import React, { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { useApi } from "../../hooks/useApi";
import type { ConsentItem, ConsentListResponse } from "../../types/consent";
import { useNavigate } from "react-router-dom";


type Props = {
  doctorId: number;
  pageSize?: number;
};

const PatientsTable: React.FC<Props> = ({ doctorId, pageSize = 10 }) => {
  const { get, loading, error } = useApi();
  const navigate = useNavigate();


  const [data, setData] = useState<ConsentItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    if (!count) return 1;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const statusBadge = (active?: boolean, expires?: string) => {
    const expired = expires ? new Date(expires) < new Date() : false;
    if (expired) return <Badge bg="secondary">Expired</Badge>;
    if (active) return <Badge bg="success">Active</Badge>;
    return <Badge bg="warning" text="dark">Paused</Badge>;
  };

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<ConsentListResponse>("/profiles/consents/", {
        params: {
          doctor: doctorId,
          is_active: true,
          page,
          page_size: pageSize,
          ordering: "-id",
        },
      });
      const items = res.result ?? [];
      const total = res.pagination?.count ?? items.length;
      setData(items);
      setCount(total);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to load patients.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, page, pageSize]);

  const goto = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold">My Patients</div>
          <div className="text-muted small">Linked via active consent</div>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? (<><Spinner animation="border" size="sm" className="me-2" />Refresh</>) : "Refresh"}
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {(error || fetchError) && (
          <div className="p-3">
            <Alert variant="danger" className="mb-0">
              {fetchError || error}
            </Alert>
          </div>
        )}

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Patient Email</th>
                <th>Scope</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : data.length ? (
                data.map((c, index) => (
                  <tr key={c.id}>
                    <td className="text-muted">{++index}</td>
                    <td className="fw-semibold">{c.patient.email}</td>
                    <td>{c.scope || "ANALYSES"}</td>
                    <td>{fmtDate(c.expires_at)}</td>
                    <td>{statusBadge(c.is_active, c.expires_at)}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(`/doctor/patients/${c.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No linked patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <Card.Footer className="bg-white d-flex justify-content-between">
        <div className="small text-muted">Showing {data.length} of {count}</div>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => goto(page - 1)}
            disabled={page === 1 || loading}
          >
            Prev
          </Button>
          <span className="small align-self-center">Page {page}</span>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => goto(page + 1)}
            disabled={data.length < pageSize || loading}
          >
            Next
          </Button>
        </div>
      </Card.Footer>
    </Card >
  );
};

export default PatientsTable;
