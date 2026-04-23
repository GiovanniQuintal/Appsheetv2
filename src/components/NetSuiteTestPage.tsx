import React, { useState } from 'react';
import { Button, Form, Row, Col, Spinner } from 'react-bootstrap';
//import './components/ProyectosPage.css'; // Ajusta la ruta a tu CSS maestro

interface NetSuiteTestPageProps {
  cambiarVista: (vista: string) => void;
}

const NetSuiteTestPage: React.FC<NetSuiteTestPageProps> = ({ cambiarVista }) => {
  // Inicializamos la caja de texto con el query de prueba que me pasaste
  const [query, setQuery] = useState<string>(
    "SELECT id, externalId, workOrder, operationSequence, title, manufacturingWorkCenter, manufacturingCostTemplate, status, startDateTime, endDate, lastModifiedDate, message, inputQuantity, completedQuantity, autoCalculateLag, runRate, setupTime, actualSetupTime, estimatedWork, actualWork, remainingWork, actualRunTime, laborResources, machineResources FROM manufacturingOperationTask WHERE workOrder = 32581 AND id = 227"
  );
  const [jsonResponse, setJsonResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEjecutarConsulta = () => {
    setIsLoading(true);
    setError(null);
    setJsonResponse(null);

    fetch('http://localhost:5114/api/NetSuite/RunQuery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Query: query })
    })
      .then(async (response) => {
        // 1. Primero leemos la respuesta como TEXTO CRUDO (para evitar que explote si no es JSON)
        const textResponse = await response.text(); 
        
        try {
          // 2. Intentamos convertir ese texto a JSON
          const data = JSON.parse(textResponse); 
          if (!response.ok) throw new Error(data.error || "Error de NetSuite");
          return data;
        } catch (e) {
          // 3. ¡Si no es JSON (como tu error actual), atrapamos el texto real del servidor!
          // Así sabremos exactamente qué línea de C# está fallando.
          throw new Error(`Crash del Servidor .NET: ${textResponse.substring(0, 200)}...`);
        }
      })
      .then((data) => {
        setJsonResponse(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  };

  return (
    <div className="wrapper">
      {/* CABECERA (Menú de navegación mantenido) */}
      <header className="header-container mb-4">
        <div className="header-left">
            <h1 className="header-title">NetSuite</h1>
        </div>
        <div className="header-right">
            <div className="top-tabs mb-2">
                <span onClick={() => cambiarVista('proyectos')}>Proyectos</span>
                <span onClick={() => cambiarVista('subproyectos')}>Subproyectos</span>
                <span onClick={() => cambiarVista('boms')}>BOMs</span>
                <span onClick={() => cambiarVista('gantt')}>Gantt</span>
                <span className="active-tab">NetSuite API</span>
            </div>
        </div>
      </header>

      <main className="main-content">
        
        <Row>
          <Col md={12} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Input SuiteQL</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ fontFamily: 'monospace', backgroundColor: '#2d2d2d', color: '#00ff00' }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button 
          variant="primary" 
          onClick={handleEjecutarConsulta} 
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? (
            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Conectando a NetSuite...</>
          ) : (
            <><i className="fa fa-play me-2"></i> Run</>
          )}
        </Button>

        {/* Zona de Errores */}
        {error && (
          <div className="alert alert-danger">
            <strong>Error de conexión:</strong> {error}
          </div>
        )}

        {/* Zona de Resultados JSON */}
        {jsonResponse && (
          <div>
            <h5 className="fw-bold">Output:</h5>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #e6e9ef',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <code>{JSON.stringify(jsonResponse, null, 4)}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default NetSuiteTestPage;