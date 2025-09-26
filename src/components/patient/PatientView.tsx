import React, { useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { useAuth } from "../../auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { PatientItem } from "../../types/patient";
import AnalysesTab from "./AnalysesTab";
import NotesTab from "./NotesTab";

const PatientView: React.FC = () => {
  const { user, logout } = useAuth();
  const { get } = useApi();

  const patientId = user?.id ?? 0;

  const [profile, setProfile] = useState<PatientItem | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const displayName = useMemo(() => {
    const fn = profile?.first_name ?? user?.first_name ?? "";
    const ln = profile?.last_name ?? user?.last_name ?? "";
    return [fn, ln].filter(Boolean).join(" ") || user?.email || "Patient";
  }, [profile, user]);

  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");

  useEffect(() => {
    if (!patientId) return;

    (async () => {
      try {
        setProfileErr(null);
        const p = await get<PatientItem>(`/profiles/consents/${patientId}/`);
        setProfile(p?.result?.patient);
      } catch (e: any) {
        setProfileErr(e?.message || "Failed to load profile.");
      }
    })();
  }, [patientId, get]);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h4 mb-0">Welcome, {displayName}</h1>
          <div className="text-muted small">
            {profile?.email || user?.email || "—"} • DOB: {fmtDate(profile?.birthday)}
          </div>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={logout}>Logout</Button>
        </Col>
      </Row>
      {profileErr && <Alert variant="danger">{profileErr}</Alert>}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <div className="small text-muted">Insurance</div>
              <div>{profile?.patient_profile?.insurance_provider || "—"}</div>
            </Col>
            <Col md={4}>
              <div className="small text-muted">Family history</div>
              <div className="text-truncate">{profile?.patient_profile?.family_history || "—"}</div>
            </Col>
            <Col md={4}>
              <div className="small text-muted">Risk factors</div>
              <div className="text-truncate">{profile?.patient_profile?.risk_factors || "—"}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs defaultActiveKey="analyses" id="patient-tabs" className="mb-0">
            <Tab eventKey="analyses" title="Analyses">
              <AnalysesTab />
            </Tab>
            <Tab eventKey="notes" title="Doctor Notes">
              <NotesTab />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default PatientView;
