import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

const DoctorView: React.FC = () => {

  const patients = [
    { id: "p1", name: "Jane Doe", dob: "1990-04-02", lastUpdate: "2025-09-10" },
    { id: "p2", name: "John Smith", dob: "1986-11-15", lastUpdate: "2025-09-08" },
    { id: "p3", name: "Alex Müller", dob: "1999-06-30", lastUpdate: "2025-09-01" },
  ];

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h3 mb-0">Welcome, Doctor</h1>
          <div className="text-muted small">
            Signed in as XXX
          </div>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={() => { }}>
            Logout
          </Button>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="mb-3">My Patients</Card.Title>
              <ListGroup variant="flush">
                {patients.map((p) => (
                  <ListGroup.Item
                    key={p.id}
                    className="d-flex justify-content-between align-items-start"
                    action
                    onClick={() => {
                      // Later: navigate to /doctor/patients/:id
                      // For now, keep it as a no-op
                    }}
                  >
                    <div>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="text-muted small">DOB: {p.dob}</div>
                    </div>
                    <Badge bg="light" text="dark">
                      Updated {p.lastUpdate}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Tip: click a patient to open their chart (coming soon).
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
                  Request checkup
                </Button>
                <Button variant="outline-secondary" disabled>
                  Add clinical note
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Actions will be enabled once the backend endpoints are connected.
            </Card.Footer>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Account</Card.Title>
              <div className="text-muted small">
                Role: YYY
              </div>
              <div className="d-grid gap-2 mt-3">
                <Button variant="outline-danger" onClick={() => { }}>
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorView;
