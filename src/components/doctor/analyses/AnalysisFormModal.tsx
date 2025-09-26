import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import { useApi } from "../../../hooks/useApi";
import type { AnalysisItem } from "../../../types/analyses";
import { ACCEPT, OCR_LANGS } from "../../../config/constants";

type Props =
  | {
    show: boolean;
    mode: "create";
    patientId: number;
    onClose: () => void;
    onSaved?: () => void;
    onUploadFile?: (analysisId: number, file: File) => Promise<void>;
    analysis?: never;
  }
  | {
    show: boolean;
    mode: "edit";
    patientId: number;
    onClose: () => void;
    onSaved?: () => void;
    onUploadFile?: (analysisId: number, file: File) => Promise<void>;
    analysis: AnalysisItem;
  };


const AnalysisFormModal: React.FC<Props> = (props) => {
  const { post, patch, loading, error } = useApi();

  const isEdit = props.mode === "edit";
  const initial = useMemo(
    () =>
      isEdit
        ? { title: props.analysis.title ?? "", ocr_language: props.analysis.ocr_language ?? "" }
        : { title: "", ocr_language: "" },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit ? props.analysis?.id : "create"]
  );

  const [title, setTitle] = useState(initial.title);
  const [ocrLang, setOcrLang] = useState(initial.ocr_language);
  const [localError, setLocalError] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!props.show) return;
    setTitle(initial.title);
    setOcrLang(initial.ocr_language);
    setLocalError("");
    setFile(null);
    setFileError("");
    setUploading(false);
  }, [props.show, initial.title, initial.ocr_language]);

  const validate = (): string => {
    if (!title.trim()) return "Title is required.";
    return "";
  };

  const unchanged =
    isEdit &&
    title.trim() === (props.analysis.title ?? "") &&
    (ocrLang || "") === (props.analysis.ocr_language || "") &&
    !file;

  const validateFile = (f: File): string => {
    if (!ACCEPT.includes(f.type)) return "Only PDF, PNG, or JPG files are allowed.";
    const maxBytes = 10 * 1024 * 1024;
    if (f.size > maxBytes) return "File is too large (max 10 MB).";
    return "";
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    const msg = validateFile(f);
    if (msg) {
      setFile(null);
      setFileError(msg);
      return;
    }
    setFileError("");
    setFile(f);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const triggerFileDialog = () => fileInputRef.current?.click();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setLocalError(v);

    try {
      const hasFile = !!file;
      let analysisId: number;

      if (isEdit) {
        if (hasFile) {
          const fd = new FormData();
          fd.append("title", title.trim());
          if (ocrLang) fd.append("ocr_language", ocrLang);
          fd.append("file", file as File);

          const res = await patch<AnalysisItem>(`/analyses/${props.analysis.id}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          analysisId = res?.id ?? props.analysis.id;
        } else {
          const res = await patch<AnalysisItem>(`/analyses/${props.analysis.id}/`, {
            title: title.trim(),
            ocr_language: ocrLang || null,
          });
          analysisId = res?.id ?? props.analysis.id;
        }
      } else {
        if (hasFile) {
          const fd = new FormData();
          fd.append("patient", String(props.patientId));
          fd.append("title", title.trim());
          if (ocrLang) fd.append("ocr_language", ocrLang);
          fd.append("file", file as File);

          const res = await post<AnalysisItem>("/analyses/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          analysisId = res!.id;
        } else {
          const res = await post<AnalysisItem>("/analyses/", {
            patient: props.patientId,
            title: title.trim(),
            ocr_language: ocrLang || null,
          });
          analysisId = res!.id;
        }
      }

      props.onSaved?.();
      props.onClose();
    } catch {
      setLocalError("Failed to save analysis.");
    }
  };


  const fileBadge = file ? (
    <div className="d-flex align-items-center gap-2 mt-2">
      <Badge bg="light" text="dark">
        {file.type.includes("pdf") ? "PDF" : file.type.includes("png") ? "PNG" : "JPG"}
      </Badge>
      <span className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
        {file.name} ({(file.size / 1024).toFixed(0)} KB)
      </span>
      <Button size="sm" variant="outline-secondary" onClick={() => setFile(null)}>
        Remove
      </Button>
    </div>
  ) : null;

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit analysis" : "Add analysis"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {(localError || error || fileError) && (
            <Alert variant="danger">{localError || error || fileError}</Alert>
          )}

          <Form.Group controlId="afmTitle" className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              placeholder="e.g. Complete Blood Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="afmOcr" className="mb-3">
            <Form.Label>OCR language (optional)</Form.Label>
            <Form.Select value={ocrLang} onChange={(e) => setOcrLang(e.target.value)}>
              <option value="">-</option>
              {OCR_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Drop zone */}
          <Form.Group controlId="afmFile" className="mb-1">
            {!file && <>
              <Form.Label>Attach analysis file (PDF/PNG/JPG)</Form.Label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={triggerFileDialog}
                role="button"
                className="border rounded d-flex align-items-center justify-content-center text-center p-4"
                style={{
                  borderStyle: "dashed",
                  background: "#fafafa",
                  cursor: "pointer",
                }}
                aria-label="Drop file here or click to select"
              >
                <div>
                  <div className="fw-semibold">Drag & drop file here</div>
                  <div className="text-muted small">or click to select from your device</div>
                  <div className="text-muted small mt-1">Accepted: PDF, PNG, JPG & max 10 MB</div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT.join(",")}
                className="d-none"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </>}
            {fileBadge}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={props.onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || uploading || (isEdit && unchanged)}
          >
            {loading || uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {uploading ? "Uploading..." : "Saving..."}
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

export default AnalysisFormModal;
