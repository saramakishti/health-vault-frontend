import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useApi } from "../../../hooks/useApi";
import type { NoteItem } from "../../../types/notes";

type BaseProps = {
  show: boolean;
  patientId: number;
  doctorId?: number;
  onClose: () => void;
  onSaved?: () => void;
};

type Props =
  | (BaseProps & { mode: "create"; note?: never })
  | (BaseProps & { mode: "edit"; note: NoteItem });

const NoteFormModal: React.FC<Props> = (props) => {
  const { post, patch, loading, error } = useApi();
  const isEdit = props.mode === "edit";

  const initial = useMemo(
    () =>
      isEdit
        ? { title: props.note.title ?? "", body: props.note.body ?? "" }
        : { title: "", body: "" },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit ? props.note?.id : "create"]
  );

  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!props.show) return;
    setTitle(initial.title);
    setBody(initial.body);
    setLocalError("");
  }, [props.show, initial]);

  const validate = (): string => {
    if (!title.trim()) return "Title is required.";
    if (!body.trim()) return "Body is required.";
    if (!isEdit && !props.doctorId) return "Doctor ID is missing.";
    return "";
  };

  const unchanged =
    isEdit &&
    title.trim() === (props.note.title ?? "") &&
    body.trim() === (props.note.body ?? "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setLocalError(v);
    try {
      if (isEdit) {
        const payload = {
          patient: (props.note.patient as any)?.id ?? props.patientId,
          doctor: (props.note.doctor as any)?.id ?? props.doctorId,
          title: title.trim(),
          body: body.trim(),
        };
        await patch(`/notes/${props.note.id}/`, payload);
      } else {
        const payload = {
          patient: props.patientId,
          doctor: props.doctorId!,
          title: title.trim(),
          body: body.trim(),
        };
        await post("/notes/", payload);
      }
      props.onSaved?.();
      props.onClose();
    } catch {
      if (!localError) setLocalError("Failed to save note.");
    }
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit note" : "Add note"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(localError || error) && <Alert variant="danger">{localError || error}</Alert>}

          <Form.Group className="mb-3" controlId="nfTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              placeholder="e.g, Follow-up plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-1" controlId="nfBody">
            <Form.Label>Body</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Write clinical note..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || (isEdit && unchanged)}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NoteFormModal;
