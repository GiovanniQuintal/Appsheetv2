import React, { useState } from 'react';

const optionsData = {
    "Packers 1": ["P1-Operacion01", "P1-Operacion02", "P1-Operacion03"],
    "Packers 2": ["P2-Operacion01", "P2-Operacion02"]
};

export default function Selector({ onStartOperation }) {
    const [selectedPacker, setSelectedPacker] = useState("");
    const [selectedOperation, setSelectedOperation] = useState("");

    const handlePackerChange = (e) => {
        setSelectedPacker(e.target.value);
        setSelectedOperation(""); // Resetea la operación si cambia el packer
    };

    return (
        <div className="container">
            <h2>Seleccionar Operación</h2>
            <div className="combo-group">
                <select value={selectedPacker} onChange={handlePackerChange} className="combo-box">
                    <option value="">Selecciona un Packer</option>
                    {Object.keys(optionsData).map(packer => (
                        <option key={packer} value={packer}>{packer}</option>
                    ))}
                </select>
            </div>

            {selectedPacker && (
                <div className="combo-group">
                    <select 
                        value={selectedOperation} 
                        onChange={(e) => setSelectedOperation(e.target.value)} 
                        className="combo-box"
                    >
                        <option value="">Selecciona una Operación</option>
                        {optionsData[selectedPacker].map(op => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>
                </div>
            )}

            <button 
                className="btn" 
                disabled={!selectedOperation} 
                onClick={() => onStartOperation(selectedOperation)}
                style={{ marginTop: '20px', width: '100%' }}
            >
                Continuar a Tracker
            </button>
        </div>
    );
}