import React, { useState, useEffect } from 'react';

interface ActiveOperation {
  idSignature: string;
  workOrder: string;
  operation: string;
  operationSequence: number;
  workCenterName: string;
  userName: string;
  start: string;
  status: string;
  remarks: string;
}

export default function AdminDashboard() {
  const [operations, setOperations] = useState<ActiveOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opToClose, setOpToClose] = useState<string | null>(null); // 👈 NUEVO
  const [isClosing, setIsClosing] = useState(false);               // 👈 NUEVO

  const fetchActiveOperations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://192.168.3.117:444/api/Operations/active');
      if (response.ok) {
        const data = await response.json();
        setOperations(data);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 NUEVA FUNCIÓN - misma lógica que en App.tsx pero local al admin
  const handleCloseOperation = async (idSignature: string) => {
    setIsClosing(true);
    try {
      const response = await fetch(`https://192.168.3.117:444/api/Operations/close/${idSignature}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        // Quitamos la operación de la lista sin recargar todo
        setOperations(prev => prev.filter(op => op.idSignature !== idSignature));
      } else {
        alert(data.message || "Error al cerrar la operación.");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setIsClosing(false);
      setOpToClose(null);
    }
  };

  useEffect(() => {
    fetchActiveOperations();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Operaciones Activas</h2>
        <button className="refresh-btn" onClick={fetchActiveOperations}>
          <i className={`fa-solid fa-arrow-rotate-right ${isLoading ? "fa-spin" : ""}`}></i>
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Operación</th>
              <th>WorkCenter</th>
              <th>Operador</th>
              <th>Inicio</th>
              <th>Estatus</th>
              <th>Acción</th> {/* 👈 NUEVA COLUMNA */}
            </tr>
          </thead>
          <tbody>
            {operations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                  No hay operaciones activas en este momento.
                </td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.idSignature}>
                  <td><strong>{op.workOrder}</strong></td>
                  <td>{op.operation} <small style={{color: '#888'}}>(Sec: {op.operationSequence})</small></td>
                  <td>{op.workCenterName}</td>
                  <td>{op.userName}</td>
                  <td>{formatTime(op.start)}</td>
                  <td>
                    <span className="status-badge">
                      <i className="fa-solid fa-spinner fa-spin" style={{marginRight: '5px'}}></i>
                      {op.status}
                    </span>
                  </td>
                  {/* 👇 BOTÓN DE CIERRE POR FILA */}
                  <td>
                    <button
                      onClick={() => setOpToClose(op.idSignature)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc3545',
                        fontSize: '1.1rem'
                      }}
                      title="Cerrar operación"
                    >
                      <i className="fa-solid fa-circle-stop"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 👇 MODAL DE CONFIRMACIÓN - mismo patrón que en Dashboard.tsx */}
      {opToClose && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-title">Confirmar cierre</div>
            <div className="confirm-body">
              ¿Estás seguro de cerrar esta operación como administrador?
            </div>
            <div className="confirm-actions">
              <button
                className="confirm-btn"
                onClick={() => setOpToClose(null)}
                disabled={isClosing}
              >
                NO
              </button>
              <button
                className="confirm-btn"
                onClick={() => handleCloseOperation(opToClose)}
                disabled={isClosing}
              >
                {isClosing ? 'Cerrando...' : 'CERRAR OPERACIÓN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}