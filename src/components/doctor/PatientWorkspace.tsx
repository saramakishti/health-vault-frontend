import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../auth/AuthContext";
import type { ConsentItem, ConsentListResponse } from "../../types/consent";
import type { PatientItem } from "../../types/patient";
import AnalysesTab from "./analyses/AnalysesTab";
import NotesTab from "./notes/NotesTab";


const PatientWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const nav = useNavigate();
  const { user: doctor } = useAuth();
  const { get, loading, error } = useApi();

  const [patient, setPatient] = useState<PatientItem | null>(null);
  const [consent, setConsent] = useState<ConsentItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const patientName = useMemo(() => {
    if (!consent) return "";
    const name = [consent.patient.first_name, consent.patient.last_name].filter(Boolean).join(" ");
    return name || consent.patient.email || `Patient #${consent.patient.id}`;
  }, [consent?.patient]);

  const consentStatus = useMemo(() => {
    if (!consent) return { badge: <Badge bg="secondary">No consent</Badge>, text: "No active consent", expired: false };
    const expired = consent.expires_at ? new Date(consent.expires_at) < new Date() : false;
    if (expired) return { badge: <Badge bg="secondary">Expired</Badge>, text: "Expired", expired: true };
    if (consent.is_active) return { badge: <Badge bg="success">Active</Badge>, text: "Active", expired: false };
    return { badge: <Badge bg="warning" text="dark">Paused</Badge>, text: "Paused", expired: false };
  }, [consent]);

  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "-");

  const load = async () => {
    setFetchError(null);
    try {
      const u = await get<PatientItem>(`/profiles/consents/${patientId}`);
      setPatient(u);

      if (doctor?.id && patientId) {
        const res = await get<ConsentListResponse>("/profiles/consents/", {
          params: { doctor: doctor.id, patient: patientId, page_size: 1 },
        });
        const c = (res.result ?? [])[0] ?? null;
        setConsent(c);
      } else {
        setConsent(null);
      }
    } catch (e: any) {
      setFetchError(e?.message || "Failed to load patient workspace.");
    }
  };

  useEffect(() => {
    if (!patientId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <Button variant="outline-secondary" size="sm" onClick={() => nav(-1)}>
            ← Back
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          {loading && !patient ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : fetchError ? (
            <Alert variant="danger" className="mb-0">{fetchError || error}</Alert>
          ) : patient ? (
            <Row className="g-3 align-items-center">
              <Col md={8}>
                <h2 className="mb-4">Patient Information</h2>
                <h3 className="h5 mb-1">{patientName}</h3>
                <div className="text-muted small">
                  {consent?.patient.email || "—"} • {consent?.patient.phone || "—"} • DOB: {fmtDate(consent?.patient.birthday)}
                </div>
                <div className="mt-2">
                  <span className="me-2">{consentStatus.badge}</span>
                  <span className="text-muted small">
                    {consent?.expires_at ? `Expires: ${new Date(consent.expires_at).toLocaleString()}` : ""}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="border-start ps-3">
                  <div className="small text-muted">Insurance</div>
                  <div>{consent?.patient.patient_profile?.insurance_provider || "—"}</div>
                  <div className="small text-muted mt-2">Risk factors</div>
                  <div className="text-truncate">{consent?.patient.patient_profile?.risk_factors || "—"}</div>
                  <div className="small text-muted mt-2">Family history</div>
                  <div className="text-truncate">{consent?.patient.patient_profile?.family_history || "—"}</div>
                </div>
              </Col>
            </Row>
          ) : null}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs defaultActiveKey="analyses" id="patient-tabs" className="mb-0">
            <Tab eventKey="analyses" title="Analyses">
              <AnalysesTab patientId={patientId} />
            </Tab>
            <Tab eventKey="notes" title="Notes">
              <NotesTab patientId={patientId} doctorId={doctor?.id} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientWorkspace;
