import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../auth/AuthContext";

const SignUp: React.FC = () => {
  const nav = useNavigate();
  const { signupPatient, loading, error, isPatient, isDoctor } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    birthday: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [localError, setLocalError] = useState<string>("");

  const set = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const validate = (): string => {
    if (!form.first_name || !form.last_name) return "First and last name are required.";
    if (!form.gender) return "Please select a gender.";
    if (!form.birthday) return "Birthdate is required.";
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Enter a valid email.";
    if (!form.phone) return "Phone is required.";
    if (!form.password || form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const v = validate();
    if (v) return setLocalError(v);

    try {
      await signupPatient({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        birthday: form.birthday,
        gender: form.gender as "M" | "W",
        role: "Patient",
      });
      if (isDoctor) nav("/doctor");
      else if (isPatient) nav("/patient");
      else nav("/");
    } catch {
      console.log("Something wrong happened!")
    }
  };

  return (
    <>
      {(localError || error) && <Alert variant="danger">{localError || error}</Alert>}
      <Form onSubmit={onSubmit} noValidate>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="suFirstName">
              <Form.Label>First name</Form.Label>
              <Form.Control
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                required
                placeholder="John"
                autoComplete="given-name"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="suLastName">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                required
                placeholder="Doe"
                autoComplete="family-name"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suGender">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="W">Female</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suBirthdate">
              <Form.Label>Birthdate</Form.Label>
              <Form.Control
                type="date"
                value={form.birthday}
                onChange={(e) => set("birthday", e.target.value)}
                required
                autoComplete="bday"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={form.phone}
                placeholder="+355 69 1234567"
                onChange={(e) => set("phone", e.target.value)}
                required
                autoComplete="tel"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                autoComplete="email"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                autoComplete="new-password"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="suConfirm">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                required
                autoComplete="new-password"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid mt-3">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default SignUp;
