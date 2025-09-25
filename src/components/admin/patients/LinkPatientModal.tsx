import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useApi } from "../../../hooks/useApi";
import type { ConsentItem } from "../../../types/consent";

type PatientLike = {
  id: number;
  user?: { id?: number; email?: string; first_name?: string; last_name?: string };
  email?: string;
  first_name?: string;
  last_name?: string;
};

type DoctorLike = {
  id: number;
  user?: { id?: number; email?: string; first_name?: string; last_name?: string };
  email?: string;
  first_name?: string;
  last_name?: string;
};

type Props = {
  show: boolean;
  doctor?: DoctorLike | null;
  patient?: PatientLike | null;
  onClose: () => void;
  onLinked?: () => void;
};


const LinkPatientModal: React.FC<Props> = ({ show, doctor, patient, onClose, onLinked }) => {
  const { get, post, loading, error } = useApi();

  const [scope, setScope] = useState<string>("ANALYSES");
  const [expiresLocal, setExpiresLocal] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState("");
  const [existing, setExisting] = useState<ConsentItem | null>(null);

  const doctorId = doctor?.id;

  useEffect(() => {
    if (!show) return;
    setScope("ANALYSES");
    setIsActive(true);
    setLocalError("");
    setExisting(null);

    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setExpiresLocal(dt);
  }, [show]);

  useEffect(() => {
    if (!show || !doctorId || !patient?.id) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await get<{ result?: ConsentItem[]; results?: ConsentItem[] }>(
          "/profiles/consents/",
          { params: { doctor: doctorId, patient: patient.id, page_size: 1 } }
        );
        if (cancelled) return;
        const found = (res.result ?? res.results ?? [])[0] || null;
        setExisting(found);
      } catch {
        if (!cancelled) setExisting(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [show, doctorId, patient?.id, get]);

  const patientName = useMemo(() => {
    if (!patient) return "";
    const u = (patient as any).user ?? patient;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    return name || u.email || `Patient #${u.id ?? patient.id}`;
  }, [patient]);

  const doctorName = useMemo(() => {
    if (!doctor) return "";
    const u = (doctor as any).user ?? doctor;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    return name || u.email || `Doctor #${u.id ?? doctor.id}`;
  }, [doctor]);

  const toIsoZ = (local: string) => {
    const date = new Date(local);
    return date.toISOString();
  };

  const canSubmit = !!doctor?.id && !!patient?.id && !!expiresLocal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!canSubmit) {
      setLocalError("Missing doctor, patient or expiry.");
      return;
    }
    try {
      await post("/profiles/consents/", {
        doctor: doctor!.id,
        patient: patient!.id,
        scope,
        expires_at: toIsoZ(expiresLocal),
        is_active: isActive,
      });
      onClose();
      onLinked?.();
    } catch {
      console.log("Something wrong happened!");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Link patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(localError || error) && <Alert variant="danger">{localError || error}</Alert>}

          <div className="mb-3">
            <div className="text-muted small">Patient</div>
            <div className="fw-semibold">{patientName}</div>
          </div>

          <p>to</p>

          <div className="mb-3">
            <div className="text-muted small">Doctor</div>
            <div className="fw-semibold">{doctorName}</div>
          </div>

          {existing && (
            <Alert variant="info" className="mb-3">
              This patient is already linked to you
              {existing.expires_at ? ` (expires ${new Date(existing.expires_at).toLocaleString()})` : ""}.
              {existing.is_active === false ? " Current status: Paused." : " Current status: Active."}
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="lpScope">
                <Form.Label>Scope</Form.Label>
                <Form.Select value={scope} onChange={(e) => setScope(e.target.value as any)}>
                  <option value="ANALYSES">Analyses</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lpExpires">
                <Form.Label>Expires</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={expiresLocal}
                  onChange={(e) => setExpiresLocal(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                id="lpActive"
                type="switch"
                label="Active immediately"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit || !!existing || loading}
          >
            {loading ? (<>Linking...</>) : "Link patient"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LinkPatientModal;
