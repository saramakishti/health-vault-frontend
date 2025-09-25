import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useApi } from "../../../hooks/useApi";
import type { PatientItem, PatientsResponse } from "../../../types/patient";

type Props = {
  show: boolean;
  onClose: () => void;
  onSelect?: (patient: PatientItem) => void;
};

const PatientSearchModal: React.FC<Props> = ({ show, onClose, onSelect }) => {
  const { get, loading, error } = useApi();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PatientItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Debounce search
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const nameOf = (p: PatientItem) => {
    const u = p.user || p;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    return name || u.email || `Patient #${u.id ?? p.id}`;
  };

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<PatientsResponse>("/authentication/users/?role=Patient", {
        params: { search: debounced || undefined, page_size: 10 },
      });
      const items = res.result ?? res.result ?? [];
      setData(items);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to search patients.");
    }
  };

  useEffect(() => {
    if (!show) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, debounced]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add patient — search</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {(fetchError || error) && (
          <Alert variant="danger">{fetchError || error}</Alert>
        )}

        <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
          <Form.Label className="small text-muted">Search by name or email</Form.Label>
          <Form.Control
            placeholder="Jane Doe or jane.doe@patient.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </Form>

        <div className="border rounded">
          {loading && !data.length ? (
            <div className="py-4 text-center">
              <Spinner animation="border" />
            </div>
          ) : data.length ? (
            <ListGroup variant="flush">
              {data.map((p) => (
                <ListGroup.Item
                  key={p.id}
                  action
                  onClick={() => onSelect?.(p)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold">{nameOf(p)}</div>
                    <div className="small text-muted">{p.user?.email ?? p.email ?? "—"}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(p);
                    }}
                  >
                    Select
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="py-4 text-center text-muted">No results.</div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PatientSearchModal;
