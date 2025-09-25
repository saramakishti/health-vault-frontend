import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../auth/AuthContext";

const SignIn: React.FC = () => {
  const nav = useNavigate();
  const { login, loading, error, isDoctor, isPatient } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Email and password are required.");
      return;
    }

    try {
      const u = await login({ email, password });
      if (u.role === "Doctor") nav("/doctor");
      else if (u.role === "Patient") nav("/patient");
      else if (u.role === "Admin") nav("/admin");
      else nav("/");
    } catch {
      console.log('Something wrong happened!')
    }
  };

  return (
    <>
      {(localError || error) && (
        <Alert variant="danger">{localError || error}</Alert>
      )}
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="signinEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="signinPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default SignIn;
