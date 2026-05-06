import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner'; 

export interface OperationData {
  idSignature: string; // Cambiamos 'id' por 'idSignature' para que coincida con el backend
  operation: string;
  workCenterId: string;
  username: string;
  remarks: string;
}

interface OpsFormProps {
  onClose: () => void;
  username: string;
  onSave: (data: OperationData) => void;
}

// Interfaz para la BD
interface WorkCenterDB {
  id: string;
  name: string;
}

// --- COMPONENTE SCANNER ---
const ScannerModal = ({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) => {
  return (
    <div className="scanner-modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <button className="scanner-close-btn" onClick={onClose} style={{ zIndex: 3050 }}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Scanner
          onScan={(result) => {
            if (Array.isArray(result) && result.length > 0) onScan(result[0].rawValue);
            else if (typeof result === 'string') onScan(result);
          }}
          onError={(error) => console.error("Error del escáner:", error)}
        />
      </div>
    </div>
  );
};

export default function OpsForm({ onClose, username, onSave }: OpsFormProps) {
  const [operation, setOperation] = useState('');
  
  // Ahora manejamos el ID para la BD y el Name para mostrarlo al usuario
  const [workCenterId, setWorkCenterId] = useState('');
  const [workCenterName, setWorkCenterName] = useState('');
  
  const [remarks, setRemarks] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado para guardar la lista que viene de la BD
  const [workCentersList, setWorkCentersList] = useState<WorkCenterDB[]>([]);

  // Efecto para cargar los WorkCenters al abrir el formulario
  useEffect(() => {
    fetch('https://192.168.3.117:444/api/WorkCenters')
      .then(res => res.json())
      .then(data => setWorkCentersList(data))
      .catch(err => console.error("Error cargando máquinas:", err));
  }, []);

  const filteredWorkCenters = workCentersList.filter(wc => 
    wc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... estados de OpsForm ...

  const handleSaveClick = async () => {
    setErrorMsg('');
    
    if (!operation || !workCenterId) {
      setErrorMsg('Operation y WorkCenter son obligatorios.');
      return;
    }

    // 1. LIMPIEZA: Quitar el símbolo '#' si viene al principio
    let cleanOp = operation.trim();
    if (cleanOp.startsWith('#')) {
      cleanOp = cleanOp.substring(1);
    }

    // 2. VALIDACIÓN: Excepciones permitidas sin punto
    const validExceptions = [
      "44534", "44545", "44556", "44567", "44578", "44589", 
      "44600", "44611", "44622", "44633", "44644", "44655", 
      "44666", "44677", "44688", "44699", "44700"
    ];

    // Si NO está en las excepciones y NO tiene punto, bloqueamos
    if (!validExceptions.includes(cleanOp) && !cleanOp.includes('.')) {
      setErrorMsg('Formato inválido: La operación debe contener un punto para indicar la secuencia (Ej. 12547.1) o ser un código especial válido.');
      return;
    }

    // 3. SEPARACIÓN: Si tiene punto, lo dividimos. Si es excepción, la secuencia es 1.
    let workOrder = cleanOp;
    let sequence = 1;

    if (cleanOp.includes('.')) {
      const parts = cleanOp.split('.');
      workOrder = parts[0];
      sequence = parseInt(parts[1], 10);
    }

    const payload = {
      workOrder: workOrder,
      operation: cleanOp, // Mandamos el número ya limpio (sin el #)
      operationSequence: sequence,
      workCenterId: workCenterId,
      username: username,
      remarks: remarks
    };

    // ... (El bloque try/catch con el fetch a /api/operations/open se queda exactamente igual) ...

    try {
      // Mandamos la petición al Backend
      const response = await fetch('https://192.168.3.117:444/api/Operations/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Se guardó en BD, le avisamos a App.tsx para que actualice la vista
        onSave({
          idSignature: data.idSignature, 
          operation: operation,
          workCenterId: workCenterId,
          username: username,
          remarks: remarks
        });
      } else {
        // Aquí mostramos si hay error de validación (ej. ya hay una abierta o faltan secuencias)
        setErrorMsg(data.message || "Error al abrir la operación.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión con el servidor.");
    }
  };

  return (
    <>
      <div className="appsheet-form">
        
        {/* Mostrar errores del servidor */}
        {errorMsg && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</div>}

        <div className="form-group">
          <label className="form-label">Operation <span>*</span></label>
          <div className="form-input-container">
            <input 
              type="text" 
              value={operation} 
              onChange={(e) => setOperation(e.target.value)} 
              placeholder="Ej. 12547.1"
            />
            <i className="fa-solid fa-qrcode icon-inside" onClick={() => setIsScanning(true)}></i>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">WorkCenter <span>*</span></label>
          <div className="form-input-container" onClick={() => setIsModalOpen(true)}>
            <input 
              type="text" 
              value={workCenterName} 
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
            {filteredWorkCenters.map((wc) => (
              <li key={wc.id} onClick={() => {
                setWorkCenterId(wc.id);
                setWorkCenterName(wc.name);
                setIsModalOpen(false); // <--- CIERRE AUTOMÁTICO
              }}>
                <input type="radio" checked={workCenterId === wc.id} readOnly />
                {wc.name}
              </li>
            ))}
          </ul>

          <div className="modal-footer">
            <button className="modal-btn clear-btn" onClick={() => { setWorkCenterId(''); setWorkCenterName(''); }}>Clear</button>
            {/* Se eliminó el botón Done */}
          </div>
        </div>
      )}

      {isScanning && (
        <ScannerModal 
          onScan={(text) => { setOperation(text); setIsScanning(false); }}
          onClose={() => setIsScanning(false)}
        />
      )}
    </>
  );
}