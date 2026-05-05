import React, { useState } from 'react';
import { OperationData } from './OpsForm'; // Importamos la interfaz

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenForm: () => void;
  operations: OperationData[]; // Recibimos la lista de operaciones
  onDeleteOp: (id: string) => void; // Función para borrar
  onCloseOp: (id: string) => void; // Función para cerrar (terminar)
}

export default function Dashboard({ activeTab, setActiveTab, onOpenForm, operations, onDeleteOp, onCloseOp }: DashboardProps) {
  
  // Estado para controlar a qué operación se le dio clic en la alarma
  const [opToClose, setOpToClose] = useState<string | null>(null);

  return (
    <div className="dashboard-container">
      
      {activeTab === 'operaciones' ? (
        operations.length === 0 ? (
          <div className="empty-state">No items</div>
        ) : (
          // Dentro del mapeo de la lista en Dashboard.tsx
<ul className="operations-list">
  {operations.map(op => (
    <li key={op.idSignature} className="operation-item">
      <div className="operation-info">
        <span className="operation-user">{op.username}</span>
        <span className="operation-number">{op.operation}</span>
      </div>
      <div className="operation-actions">
        {/* Borrar local (opcional) */}
        <i className="fa-solid fa-trash-can" onClick={() => onDeleteOp(op.idSignature)}></i>
        
        {/* Ícono de Check estático */}
        <i className="fa-regular fa-circle-check"></i>
        
        {/* BOTÓN DEL RELOJ: Al dar clic, guardamos el idSignature para el modal */}
        <i 
          className="fa-solid fa-clock" 
          onClick={() => setOpToClose(op.idSignature)}
          style={{ color: '#0d6efd', cursor: 'pointer' }}
        ></i>
      </div>
    </li>
  ))}
</ul>
        )
      ) : (
        <div className="empty-state"></div>
      )}

      {activeTab === 'operaciones' && (
        <button className="fab-button" onClick={onOpenForm}>
          <i className="fa-solid fa-plus"></i>
        </button>
      )}

      <div className="bottom-nav">
        <div 
          className={`nav-item ${activeTab === 'operaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('operaciones')}
        >
          <i className="fa-regular fa-pen-to-square"></i>
          <span>Operaciones</span>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {opToClose && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-title">Confirm</div>
            <div className="confirm-body">¿Esta seguro de cerrar la operación?</div>
            <div className="confirm-actions">
              <button className="confirm-btn" onClick={() => setOpToClose(null)}>NO</button>
              <button 
                className="confirm-btn" 
                onClick={() => {
                  onCloseOp(opToClose);
                  setOpToClose(null);
                }}
              >
                CERRAR OPERACIÓN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}