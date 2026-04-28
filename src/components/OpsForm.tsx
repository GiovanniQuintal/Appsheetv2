import React, { useState } from 'react';
// 1. IMPORTAMOS LA NUEVA LIBRERÍA
import { Scanner } from '@yudiel/react-qr-scanner'; 

export interface OperationData {
  id: string;
  operation: string;
  workCenter: string;
  username: string;
  remarks: string;
}

interface OpsFormProps {
  onClose: () => void;
  username: string;
  onSave: (data: OperationData) => void;
}

const workCentersList = [
  "TORNO 1", "TORNO 2", "TORNO 3", "TORNO 4",
  "CENTRO DE MAQUINADO 1", "CENTRO DE MAQUINADO 2", "CENTRO DE MAQUINADO 3",
  "CONTROL DE CALIDAD 1", "CONTROL DE CALIDAD 2", "TORNO CONVENCIONAL"
];

// =======================================================
// COMPONENTE ACTUALIZADO CON @yudiel/react-qr-scanner
// =======================================================
const ScannerModal = ({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) => {
  return (
    <div className="scanner-modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <button className="scanner-close-btn" onClick={onClose} style={{ zIndex: 3050 }}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Scanner
          onScan={(result) => {
            // Yudiel actualizó su librería y ahora devuelve un arreglo de resultados.
            // Esta validación cubre la lectura correcta del código 128 o QR.
            if (Array.isArray(result) && result.length > 0) {
              onScan(result[0].rawValue);
            } else if (typeof result === 'string') {
              onScan(result);
            }
          }}
          onError={(error) => {
            console.error("Error del escáner:", error);
          }}
        />
      </div>
    </div>
  );
};


export default function OpsForm({ onClose, username, onSave }: OpsFormProps) {
  const [operation, setOperation] = useState('');
  const [workCenter, setWorkCenter] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isScanning, setIsScanning] = useState(false);

  const filteredWorkCenters = workCentersList.filter(wc => 
    wc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClick = () => {
    const newOp: OperationData = {
      id: Math.random().toString(36).substr(2, 9),
      operation,
      workCenter,
      username,
      remarks
    };
    onSave(newOp);
  };

  return (
    <>
      <div className="appsheet-form">
        <div className="form-group">
          <label className="form-label">Operation <span>*</span></label>
          <div className="form-input-container">
            <input 
              type="text" 
              value={operation} 
              onChange={(e) => setOperation(e.target.value)} 
            />
            <i 
              className="fa-solid fa-qrcode icon-inside" 
              onClick={() => setIsScanning(true)}
            ></i>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">WorkCenter <span>*</span></label>
          <div className="form-input-container" onClick={() => setIsModalOpen(true)}>
            <input 
              type="text" 
              value={workCenter} 
              readOnly 
              placeholder="Seleccionar..." 
            />
            <i className="fa-solid fa-caret-down icon-inside"></i>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">User <span>*</span></label>
          <div className="form-input-container">
            <input type="text" value={username} disabled style={{ background: '#f0f0f0', color: '#666' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Remarks <span>*</span></label>
          <div className="form-input-container">
            <input 
              type="text" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="form-bottom-bar">
        <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
        <button className="btn-guardar" onClick={handleSaveClick}>Guardar</button>
      </div>

      {isModalOpen && (
        <div className="full-modal">
          <div className="modal-header">WorkCenter</div>
          <div className="modal-search">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ul className="modal-list">
            {filteredWorkCenters.map((wc, index) => (
              <li key={index} onClick={() => setWorkCenter(wc)}>
                <input 
                  type="radio" 
                  checked={workCenter === wc} 
                  onChange={() => setWorkCenter(wc)}
                />
                {wc}
              </li>
            ))}
          </ul>

          <div className="modal-footer">
            <button className="modal-btn clear-btn" onClick={() => setWorkCenter('')}>Clear</button>
            <button className="modal-btn done-btn" onClick={() => setIsModalOpen(false)}>Done</button>
          </div>
        </div>
      )}

      {/* AQUÍ LLAMAMOS AL NUEVO COMPONENTE AISLADO */}
      {isScanning && (
        <ScannerModal 
          onScan={(text) => {
            setOperation(text);
            setIsScanning(false);
          }}
          onClose={() => setIsScanning(false)}
        />
      )}
    </>
  );
}