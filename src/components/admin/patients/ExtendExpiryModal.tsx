import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useApi } from "../../../hooks/useApi";

type Props = {
  show: boolean;
  consentId?: number | null;
  currentExpiry?: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const toIso = (local: string) => new Date(local).toISOString();

const ExtendExpiryModal: React.FC<Props> = ({ show, consentId, currentExpiry, onClose, onSaved }) => {
  const { patch, loading, error } = useApi();
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    if (show) setLocalValue(toLocalInputValue(currentExpiry) || "");
  }, [show, currentExpiry]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentId || !localValue) return;
    await patch(`/profiles/consents/${consentId}/`, { expires_at: toIso(localValue) });
    onClose();
    onSaved?.();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={submit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Extend expiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="extExpiry">
            <Form.Label>New expiry</Form.Label>
            <Form.Control
              type="datetime-local"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!localValue || loading}>
            {loading ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExtendExpiryModal;
