import React, { useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../../auth/AuthContext";
import PatientsTable from "./PatientsTable";

const DoctorView: React.FC = () => {
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    const fn = user?.first_name || "";
    const ln = user?.last_name || "";
    return [fn, ln].filter(Boolean).join(" ") || user?.email || "Doctor";
  }, [user]);

  const onLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h4 mb-0">Welcome, Dr. {displayName}</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={onLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      {!user?.id ? (
        <Alert variant="warning">No doctor account detected.</Alert>
      ) : (
        <PatientsTable doctorId={user.id} />
      )}
    </Container>
  );
};

export default DoctorView;
