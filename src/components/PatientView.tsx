import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

const PatientView: React.FC = () => {

  const recentResults = [
    { id: "o1", test: "HbA1c", value: "5.4 %", date: "2025-09-10" },
    { id: "o2", test: "LDL-C", value: "110 mg/dL", date: "2025-09-01" },
    { id: "o3", test: "Vitamin D", value: "28 ng/mL", date: "2025-08-15" },
  ];

  const upcoming = [
    { id: "c1", title: "General checkup", window: "2025-09-25 10:00–11:00", status: "REQUESTED" },
  ];

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h3 mb-0">Welcome</h1>
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
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="mb-3">My Health Timeline</Card.Title>
              <ListGroup variant="flush">
                {recentResults.map((r) => (
                  <ListGroup.Item
                    key={r.id}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <div className="fw-semibold">{r.test}</div>
                      <div className="text-muted small">Recorded: {r.date}</div>
                    </div>
                    <Badge bg="light" text="dark">
                      {r.value}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Trends and charts will appear here after documents are processed.
            </Card.Footer>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Upcoming Checkups</Card.Title>
              {upcoming.length === 0 ? (
                <div className="text-muted">No checkups scheduled.</div>
              ) : (
                <ListGroup variant="flush">
                  {upcoming.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <div className="fw-semibold">{c.title}</div>
                        <div className="text-muted small">{c.window}</div>
                      </div>
                      <Badge bg="warning" text="dark">
                        {c.status}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
            <Card.Footer className="text-muted small">
              You’ll be able to accept or request a new time once backend is connected.
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

export default PatientView;
