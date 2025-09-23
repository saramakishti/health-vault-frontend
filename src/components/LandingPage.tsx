import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { APP_NAME, APP_TAGLINE } from "../config/constants";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const LandingPage: React.FC = () => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0" style={{ minHeight: "100vh" }}>
        <Col
          lg={6}
          className="d-none d-lg-block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/hero-medical.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="h-100 d-flex flex-column justify-content-center text-white"
            style={{ padding: "4rem" }}
          >
            <h1 className="display-5 fw-semibold mb-3">{APP_NAME}</h1>
            <p className="lead mb-0" style={{ maxWidth: 640 }}>
              {APP_TAGLINE}
            </p>
          </div>
        </Col>

        <Col
          lg={6}
          className="d-flex align-items-center justify-content-center"
          style={{ padding: "2rem" }}
        >
          <Card className="shadow-sm w-100" style={{ maxWidth: 560 }}>
            <Card.Body className="p-4 p-md-5">
              <Card.Title className="mb-2 text-center">{APP_NAME}</Card.Title>

              <Tabs defaultActiveKey="login" className="mb-3 justify-content-center">
                <Tab eventKey="login" title="Login">
                  <SignIn />
                </Tab>
                <Tab eventKey="signup" title="Patient Signup">
                  <SignUp />
                </Tab>
              </Tabs>

              <div className="text-center text-muted small mt-3">
                By continuing, you agree to our terms and privacy policy.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
