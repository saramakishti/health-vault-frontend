import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useApi } from "../../../hooks/useApi";
import type { DoctorItem, DoctorsResponse } from "../../../types/doctor";

type Props = {
  show: boolean;
  onClose: () => void;
  onSelect?: (doctor: DoctorItem) => void;
};

const DoctorSearchModal: React.FC<Props> = ({ show, onClose, onSelect }) => {
  const { get, loading, error } = useApi();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<DoctorItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // debounce
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const nameOf = (d: DoctorItem) => {
    const u = d.user || d;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    return name || u.email || `Doctor #${u.id ?? d.id}`;
  };

  const load = async () => {
    setFetchError(null);
    try {
      const res = await get<DoctorsResponse>("/authentication/users/?role=Doctor", {
        params: { search: debounced || undefined, page_size: 10 },
      });
      setData(res.result ?? []);
    } catch (e: any) {
      setFetchError(e?.message || "Failed to search doctors.");
    }
  };

  useEffect(() => {
    if (!show) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, debounced]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton><Modal.Title>Select doctor</Modal.Title></Modal.Header>
      <Modal.Body>
        {(fetchError || error) && <Alert variant="danger">{fetchError || error}</Alert>}

        <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
          <Form.Label className="small text-muted">Search by name or email</Form.Label>
          <Form.Control
            placeholder="Jane Doe or jane@doctor.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </Form>

        <div className="border rounded">
          {loading && !data.length ? (
            <div className="py-4 text-center"><Spinner animation="border" /></div>
          ) : data.length ? (
            <ListGroup variant="flush">
              {data.map((d) => (
                <ListGroup.Item
                  key={d.id}
                  action
                  onClick={() => onSelect?.(d)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold">{nameOf(d)}</div>
                    <div className="small text-muted">{d.user?.email ?? d.email ?? "—"}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(d);
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
    </Modal>
  );
};

export default DoctorSearchModal;
