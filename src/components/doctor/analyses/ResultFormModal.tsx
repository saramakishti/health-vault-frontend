import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useApi } from "../../../hooks/useApi";
import type { ResultItem } from "../../../types/results";

type Props =
  | {
    show: boolean;
    mode: "create";
    analysisId?: number;
    onClose: () => void;
    onSaved?: () => void;
    result?: never;
  }
  | {
    show: boolean;
    mode: "edit";
    analysisId?: number;
    onClose: () => void;
    onSaved?: () => void;
    result: ResultItem;
  };

const ResultFormModal: React.FC<Props> = (props) => {
  const { post, patch, loading, error } = useApi();
  const isEdit = props.mode === "edit";

  const initial = useMemo(
    () =>
      isEdit
        ? {
          test_name: props.result.test_name ?? "",
          value: props.result.value ?? "",
          unit: props.result.unit ?? "",
          reference_range: props.result.reference_range ?? "",
          measured_at: props.result.measured_at ?? "",
        }
        : {
          test_name: "",
          value: "",
          unit: "",
          reference_range: "",
          measured_at: "",
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit ? props.result?.id : "create"]
  );

  const [testName, setTestName] = useState(initial.test_name);
  const [value, setValue] = useState(initial.value);
  const [unit, setUnit] = useState(initial.unit);
  const [reference, setReference] = useState(initial.reference_range);
  const [measuredAt, setMeasuredAt] = useState(initial.measured_at);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!props.show) return;
    setTestName(initial.test_name);
    setValue(initial.value);
    setUnit(initial.unit);
    setReference(initial.reference_range);
    setMeasuredAt(initial.measured_at);
    setLocalError("");
  }, [props.show, initial]);

  const validate = (): string => {
    if (!testName.trim()) return "Test name is required.";
    if (!value.trim()) return "Value is required.";
    if (!measuredAt) return "Measured date is required.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(measuredAt)) return "Measured date must be YYYY-MM-DD.";
    return "";
  };

  const unchanged =
    isEdit &&
    testName.trim() === (props.result.test_name ?? "") &&
    value.trim() === (props.result.value ?? "") &&
    (unit || "") === (props.result.unit || "") &&
    (reference || "") === (props.result.reference_range || "") &&
    (measuredAt || "") === (props.result.measured_at || "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setLocalError(v);
    try {
      const body = {
        analysis: props.analysisId,
        test_name: testName.trim(),
        value: value.trim(),
        unit: unit || "",
        reference_range: reference || "",
        measured_at: measuredAt,
      };

      if (isEdit) {
        await patch(`/analyses/results/${props.result.id}/`, body);
      } else {
        await post("/analyses/results/", body);
      }

      props.onSaved?.();
      props.onClose();
    } catch {
      if (!localError) setLocalError("Failed to save result.");
    }
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit result" : "Add result"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(localError || error) && <Alert variant="danger">{localError || error}</Alert>}

          <Form.Group className="mb-3" controlId="rfmTestName">
            <Form.Label>Test name</Form.Label>
            <Form.Control
              placeholder="e.g., Hemoglobin"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="rfmValue">
            <Form.Label>Value</Form.Label>
            <Form.Control
              placeholder="e.g., 13.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="rfmUnit">
            <Form.Label>Unit (optional)</Form.Label>
            <Form.Control
              placeholder="e.g., g/dL"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="rfmReference">
            <Form.Label>Reference range (optional)</Form.Label>
            <Form.Control
              placeholder="e.g., 12–16"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-1" controlId="rfmMeasuredAt">
            <Form.Label>Measured at</Form.Label>
            <Form.Control
              type="date"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
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
                Saving...
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

export default ResultFormModal;
