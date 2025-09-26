import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import { useApi } from "../../../hooks/useApi";
import AnalysisPanel from "./AnalysisPanel";
import type { AnalysisItem } from "../../../types/analyses";

type AnalysisResponse = AnalysisItem;

const AnalysisDetailPage: React.FC = () => {
  const nav = useNavigate();
  const { analysisId } = useParams();
  const { get, loading, error } = useApi();

  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    (async () => {
      try {
        const data = await get<AnalysisResponse>(`/analyses/${analysisId}/`);
        setAnalysis(data);
      } catch {
        console.log('Something wrong happened!');
      }
    })();
  }, [analysisId, get]);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h5 mb-0">Analysis Results</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={() => nav(-1)}>
            Back
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {!analysis ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center">
            {loading ? <Spinner animation="border" /> : "Analysis not found."}
          </Card.Body>
        </Card>
      ) : (
        <AnalysisPanel analysisId={Number(analysisId)} analysis={analysis} canEdit={false} />
      )}
    </Container>
  );
};

export default AnalysisDetailPage;
