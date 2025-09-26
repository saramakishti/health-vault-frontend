import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useApi } from "../../../hooks/useApi";
import type { ConsentItem } from "../../../types/consent";

type Props = {
  show: boolean;
  consent?: ConsentItem | null;
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

const ExtendExpiryModal: React.FC<Props> = ({ show, consent, onClose, onSaved }) => {
  const { patch, loading, error } = useApi();
  const [localValue, setLocalValue] = useState("");
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {

    if (!show) return;
    setLocalValue(toLocalInputValue(consent?.expires_at ?? null) || "");
    setActive(!!consent?.is_active);
  }, [show, consent]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent?.id || !localValue) return;
    const payload = {
      patient: (consent.patient as any)?.id ?? consent.patient,
      doctor: (consent.doctor as any)?.id ?? consent.doctor,
      scope: consent.scope ?? "ANALYSES",
      expires_at: toIso(localValue),
      is_active: active,
    };
    await patch(`/profiles/consents/${consent.id}/`, payload);
    onClose();
    onSaved?.();
  };

  const unchanged =
    toLocalInputValue(consent?.expires_at ?? null) === localValue &&
    active === !!consent?.is_active;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={submit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Extend expiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="small text-muted mb-2">
            Current: {consent?.expires_at ? new Date(consent.expires_at).toLocaleString() : "—"}
          </div>
          <Form.Group controlId="extExpiry">
            <Form.Label>New expiry</Form.Label>
            <Form.Control
              type="datetime-local"
              value={localValue}
              min={toLocalInputValue(new Date().toISOString())}
              onChange={(e) => setLocalValue(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Check
            className="mt-3"
            type="switch"
            id="extActive"
            label="Active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!localValue || unchanged || loading}>
            {loading ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExtendExpiryModal;
