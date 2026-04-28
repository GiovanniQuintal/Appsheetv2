import React, { useState } from 'react';
import { useZxing } from 'react-zxing'; // <--- 1. Importamos la librería

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

export default function OpsForm({ onClose, username, onSave }: OpsFormProps) {
  const [operation, setOperation] = useState('');
  const [workCenter, setWorkCenter] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Estado para abrir/cerrar la cámara
  const [isScanning, setIsScanning] = useState(false);

  // 3. Configuración del escáner
// 3. Configuración del escáner (Actualizada)
  const { ref } = useZxing({
    onResult(result: any) {
      // Cuando lee un código, lo pone en el input de operación y cierra la cámara
      setOperation(result.getText());
      setIsScanning(false);
    },
    onError(error) {
      // Si la pantalla se queda negra, esto nos dirá por qué en la consola
      console.error("Error al abrir la cámara:", error);
    },
    // Le decimos que obligatoriamente use la cámara trasera del celular
    constraints: {
      video: { facingMode: 'environment' } 
    }
  });

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
            {/* Al hacer clic en el ícono, encendemos la cámara */}
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

      {/* MODAL DEL WORKCENTER */}
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

      {/* MODAL DE LA CÁMARA (NUEVO) */}
      {isScanning && (
        <div className="scanner-modal">
          <button className="scanner-close-btn" onClick={() => setIsScanning(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          {/* Aquí es donde se inyecta la cámara del celular/PC */}
          <video ref={ref} className="scanner-video" />
        </div>
      )}
    </>
  );
}