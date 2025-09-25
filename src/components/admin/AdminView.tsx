import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import UserManagement from "./users/UserManagement";
import PatientManagement from "./patients/PatientManagement";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "react-bootstrap";

const AdminView: React.FC = () => {
  const { user, logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4 mt-3">
        <Col>
          <h1 className="h3 mb-0">Welcome, {user?.first_name}</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={onLogout}>
            Logout
          </Button>
        </Col>
      </Row>
      <Tabs defaultActiveKey="users" id="admin-tabs" className="mb-3">
        <Tab eventKey="users" title="User Management">
          <UserManagement />
        </Tab>
        <Tab eventKey="patients" title="Patient Management">
          <PatientManagement />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminView;
