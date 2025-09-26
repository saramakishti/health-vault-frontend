import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { useAuth } from "../../../auth/AuthContext";
import { useApi } from "../../../hooks/useApi";
import type { ConsentItem, ConsentListResponse } from "../../../types/consent";
import { DEFAULT_PAGE_SIZE } from "../../../config/constants";
import DoctorSearchModal from "./DoctorSearchModal";
import PatientSearchModal from "./PatientSearchModal";
import LinkPatientModal from "./LinkPatientModal";
import ExtendExpiryModal from "./ExtendExpiryModal";
import { Col, Row } from "react-bootstrap";

const PatientManagement: React.FC = () => {

  const { get, del, patch, loading, error } = useApi();

  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [extendFor, setExtendFor] = useState<ConsentItem | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<ConsentListResponse>("/profiles/consents/", {
        params: {
          page,
          page_size: DEFAULT_PAGE_SIZE,
          ordering: "-id",
        },
      });
      const items = res.result ?? [];
      const total = res.pagination?.count ?? items.length;
      setConsents(items);
      setCount(total);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to load patients.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const statusBadge = (active?: boolean, expires?: string) => {
    const expired = expires ? new Date(expires) < new Date() : false;
    if (expired) return <Badge bg="secondary">Expired</Badge>;
    if (active) return <Badge bg="success">Active</Badge>;
    return <Badge bg="warning" text="dark">Paused</Badge>;
  };

  const onUnlink = async (consentId: number) => {
    if (!window.confirm("Unlink this patient? They will be removed from your list.")) return;
    setFetchError(null);
    try {
      await del(`/profiles/consents/${consentId}/`);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to unlink patient.");
    }
  };

  const onToggleActive = async (c: ConsentItem) => {
    try {
      const payload = {
        patient: (c.patient as any)?.id ?? c.patient,
        doctor: (c.doctor as any)?.id ?? c.doctor,
        scope: c.scope ?? "ANALYSES",
        expires_at: c.expires_at,
        is_active: !c.is_active,
      };
      await patch(`/profiles/consents/${c.id}/`, payload);
      await load();
    } catch (e: any) {
      setFetchError(e?.message || "Failed to update consent status.");
    }
  };



  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex align-items-center">
          <Row className="g-2 align-items-end">
            <Col xs={12} md="auto" className="mt-4">
              <h1 className="h5 mb-0">Patient Management</h1>
              <div className="text-muted small">View and manage all patients linked to doctors via active consent</div>
            </Col>
          </Row>
          <div className="ms-auto">
            <Button className="me-2" variant="primary" onClick={() => setShowPatientSearch(true)}>
              + Link patient to doctor
            </Button>

            <Button
              variant="outline-secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Refresh
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
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
                  <th>Doctor Email</th>
                  <th>Scope</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !consents.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                ) : consents.length ? (
                  consents.map((c, index) => (
                    <tr key={c.id}>
                      <td className="text-muted">{++index}</td>
                      <td className="fw-semibold">{c.patient_email}</td>
                      <td className="fw-semibold">{c.doctor_email}</td>
                      <td>{c.scope || "ANALYSES"}</td>
                      <td>{fmtDate(c.expires_at)}</td>
                      <td>{statusBadge(c.is_active, c.expires_at)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setExtendFor(c)}
                          >
                            Extend
                          </Button>
                          <Button
                            size="sm"
                            variant={c.is_active ? "outline-warning" : "outline-success"}
                            onClick={() => onToggleActive(c)}
                            disabled={loading}
                          >
                            {c.is_active ? "Pause" : "Resume"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => onUnlink(c.id)}
                            disabled={loading}
                          >
                            Unlink
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      No linked patients yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <Card.Footer className="bg-white d-flex justify-content-between">
          <div className="small text-muted">
            Showing {consents.length} of {count}
          </div>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Prev
            </Button>
            <span className="small align-self-center">Page {page}</span>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={consents.length < DEFAULT_PAGE_SIZE || loading}
            >
              Next
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <PatientSearchModal
        show={showPatientSearch}
        onClose={() => setShowPatientSearch(false)}
        onSelect={(p) => {
          setSelectedPatient(p);
          setShowPatientSearch(false);
          setShowDoctorSearch(true);
        }}
      />

      <DoctorSearchModal
        show={showDoctorSearch}
        onClose={() => setShowDoctorSearch(false)}
        onSelect={(d) => {
          setSelectedDoctor(d);
          setShowDoctorSearch(false);
          setShowLink(true);
        }}
      />

      <LinkPatientModal
        show={showLink}
        doctor={selectedDoctor}
        patient={selectedPatient}
        onClose={() => setShowLink(false)}
        onLinked={() => {
          setShowLink(false);
          setSelectedDoctor(null);
          setSelectedPatient(null);
          void load();
        }}
      />


      <ExtendExpiryModal
        show={!!extendFor}
        consent={extendFor}
        onClose={() => setExtendFor(null)}
        onSaved={() => { setExtendFor(null); void load(); }}
      />
    </>
  )
}

export default PatientManagement;