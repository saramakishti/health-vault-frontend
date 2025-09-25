import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useApi } from "../../../hooks/useApi";
import type { Role } from "../../../types/auth";

type UserMinimal = {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string;
  gender: "M" | "W";
  role: Role;
  doctor_profile?: {
    specialization?: string;
    license_number?: string;
    hospital_affiliation?: string;
  };
  patient_profile?: {
    family_history?: string;
    risk_factors?: string;
    insurance_provider?: string;
  };
};

type Props = {
  mode: "create" | "edit";
  show: boolean;
  onClose: () => void;
  initial?: UserMinimal;
  onSaved?: () => void;
};

const ROLES: Role[] = ["Admin", "Doctor", "Patient"];

const emptyForm: UserMinimal & { password?: string } = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  birthday: "",
  gender: "M",
  role: "Patient",
  doctor_profile: {
    specialization: "",
    license_number: "",
    hospital_affiliation: "",
  },
  patient_profile: {
    family_history: "",
    risk_factors: "",
    insurance_provider: "",
  },
  password: "",
};

const UserModal: React.FC<Props> = ({ mode, show, onClose, onSaved, initial }) => {
  const { post, patch, loading, error } = useApi();

  const [form, setForm] = useState<UserMinimal & { password?: string }>(emptyForm);
  const [localError, setLocalError] = useState("");

  // hydrate form when opening in edit mode
  useEffect(() => {
    if (show) {
      if (mode === "edit" && initial) {
        setForm({ ...emptyForm, ...initial, password: "" });
      } else {
        setForm(emptyForm);
      }
      setLocalError("");
    }
  }, [show, mode, initial]);

  const isDoctor = useMemo(() => form.role === "Doctor", [form.role]);
  const isPatient = useMemo(() => form.role === "Patient", [form.role]);

  const set = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const validate = (): string => {
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Enter a valid email.";
    if (!form.first_name || !form.last_name) return "First and last name are required.";
    // if (!form.phone) return "Phone is required.";
    if (!form.birthday) return "Birthday is required.";
    if (!form.gender) return "Gender is required.";
    if (!form.role) return "Role is required.";
    if (mode === "create" && (!form.password || form.password.length < 8))
      return "Password must be at least 8 characters.";
    if (isDoctor) {
      const d = form.doctor_profile || {};
      if (!d.specialization || !d.license_number)
        return "For doctors, specialization and license number are required.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const v = validate();
    if (v) return setLocalError(v);

    try {
      if (mode === "create") {
        const payload: any = {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          birthday: form.birthday,
          gender: form.gender,
          password: form.password,
          role: form.role,
        };
        if (isDoctor) payload.doctor_profile = form.doctor_profile;
        if (isPatient) payload.patient_profile = form.patient_profile;
        await post("/authentication/users/", payload);
      } else {
        if (!initial?.id) throw new Error("Missing user id for edit.");
        const payload: any = {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          birthday: form.birthday,
          gender: form.gender,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        if (isDoctor) payload.doctor_profile = form.doctor_profile;
        if (isPatient) payload.patient_profile = form.patient_profile;
        await patch(`/authentication/users/${initial.id}/`, payload);
      }
      onClose();
      onSaved?.();
    } catch {
      console.log('Something wrong happened!')
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{mode === "create" ? "Create user" : "Edit user"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {(localError || error) && <Alert variant="danger">{localError || error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="umEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="user@example.com"
                  disabled={mode === "edit"}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="umPassword">
                <Form.Label>{mode === "create" ? "Password" : "New password (optional)"}</Form.Label>
                <Form.Control
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={mode === "create" ? "At least 8 characters" : "Leave blank to keep"}
                  required={mode === "create"}
                  autoComplete={mode === "create" ? "new-password" : "off"}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="umFirst">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  required
                  placeholder="Jane"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="umLast">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  required
                  placeholder="Doe"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="umPhone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  required={false}
                  placeholder="+355 691234567"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="umBirthday">
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  value={form.birthday}
                  onChange={(e) => set("birthday", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="umGender">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value as "M" | "W")}
                  required
                >
                  <option value="M">Male</option>
                  <option value="W">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="umRole">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value as Role)}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {isDoctor && (
              <>
                <Col xs={12}>
                  <hr className="my-2" />
                  <div className="text-muted small mb-2">Doctor profile</div>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umDocSpec">
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control
                      value={form.doctor_profile?.specialization || ""}
                      onChange={(e) =>
                        set("doctor_profile", {
                          ...form.doctor_profile,
                          specialization: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umDocLicense">
                    <Form.Label>License number</Form.Label>
                    <Form.Control
                      value={form.doctor_profile?.license_number || ""}
                      onChange={(e) =>
                        set("doctor_profile", {
                          ...form.doctor_profile,
                          license_number: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umDocHosp">
                    <Form.Label>Hospital affiliation</Form.Label>
                    <Form.Control
                      value={form.doctor_profile?.hospital_affiliation || ""}
                      onChange={(e) =>
                        set("doctor_profile", {
                          ...form.doctor_profile,
                          hospital_affiliation: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            {isPatient && (
              <>
                <Col xs={12}>
                  <hr className="my-2" />
                  <div className="text-muted small mb-2">Patient profile</div>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umPatFamily">
                    <Form.Label>Family history</Form.Label>
                    <Form.Control
                      value={form.patient_profile?.family_history || ""}
                      onChange={(e) =>
                        set("patient_profile", {
                          ...form.patient_profile,
                          family_history: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umPatRisk">
                    <Form.Label>Risk factors</Form.Label>
                    <Form.Control
                      value={form.patient_profile?.risk_factors || ""}
                      onChange={(e) =>
                        set("patient_profile", {
                          ...form.patient_profile,
                          risk_factors: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="umPatIns">
                    <Form.Label>Insurance provider</Form.Label>
                    <Form.Control
                      value={form.patient_profile?.insurance_provider || ""}
                      onChange={(e) =>
                        set("patient_profile", {
                          ...form.patient_profile,
                          insurance_provider: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : mode === "create" ? (
              "Create user"
            ) : (
              "Save changes"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
