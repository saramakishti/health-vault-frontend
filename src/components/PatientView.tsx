import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { useAuth } from "../auth/AuthContext";

const PatientView: React.FC = () => {

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
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h3 mb-0">Welcome, {user?.first_name} {user?.last_name}</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={onLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="mb-3">My Health Timeline</Card.Title>
              <ListGroup variant="flush">

              </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Trends and charts will appear here after documents are processed.
            </Card.Footer>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Upcoming Checkups</Card.Title>

            </Card.Body>
            <Card.Footer className="text-muted small">
              You'll be able to accept or request a new time once backend is connected.
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2 mt-3">
                <Button variant="primary" disabled>
                  Upload analysis (PDF/PNG/JPG)
                </Button>
                <Button variant="outline-primary" disabled>
                  View my documents
                </Button>
                <Button variant="outline-secondary" disabled>
                  Edit profile
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Actions will be enabled after API endpoints are available.
            </Card.Footer>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Account Overview</Card.Title>
              <div className="text-muted small">
                Role: {user?.role}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientView;
