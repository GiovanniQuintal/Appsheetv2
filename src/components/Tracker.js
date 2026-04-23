import React, { useState } from 'react';
import { useStopwatch } from './useStopwatch';

export default function Tracker({ operationName, onBack }) {
    const mainClock = useStopwatch();
    const breakClock = useStopwatch();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [breakHistory, setBreakHistory] = useState([]);
    const [breakReason, setBreakReason] = useState("Políticas de la empresa");

    // Lógica para iniciar el Break
    const handleOpenBreakModal = () => {
        mainClock.pause(); // Pausa el principal inmediatamente
        setIsModalOpen(true);
    };

    const handleStartBreak = () => {
        setIsModalOpen(false);
        breakClock.start(); // Inicia el secundario
    };

    // Lógica para terminar el Break
    const handleFinishBreak = () => {
        breakClock.pause();
        // Guardamos el registro del break
        setBreakHistory([...breakHistory, { reason: breakReason, time: breakClock.formattedTime() }]);
        breakClock.reset();
        mainClock.start(); // Reanuda el principal
    };

    return (
        <div className="container">
            <button className="btn-small" onClick={onBack}>⬅ Volver</button>
            <h3>Operación: {operationName}</h3>
            
            {/* Reloj Principal */}
            <div className={`timeDisplay ${breakClock.isRunning ? 'dimmed' : ''}`}>
                <h4>Tiempo Principal</h4>
                {mainClock.formattedTime()}
            </div>

            <div className="buttons">
                {!mainClock.isRunning && !breakClock.isRunning && (
                    <button className="btn start-btn" onClick={mainClock.start}>▶ Play</button>
                )}
                {mainClock.isRunning && (
                    <button className="btn pause-btn" onClick={mainClock.pause}>⏸ Pausa</button>
                )}
                <button 
                    className="btn break-btn" 
                    onClick={handleOpenBreakModal}
                    disabled={!mainClock.isRunning && mainClock.time === 0}
                >
                    ☕ Break
                </button>
            </div>

            {/* Reloj de Break (Visible solo si está corriendo) */}
            {breakClock.isRunning && (
                <div className="break-section">
                    <div className="timeDisplay break-display">
                        <h4>Tiempo en Break ({breakReason})</h4>
                        {breakClock.formattedTime()}
                    </div>
                    <button className="btn finish-break-btn" onClick={handleFinishBreak}>
                        Terminar Break y Reanudar
                    </button>
                </div>
            )}

            {/* Historial de Breaks */}
            {breakHistory.length > 0 && (
                <div className="laps">
                    <h3>Registro de Breaks</h3>
                    <ul>
                        {breakHistory.map((b, index) => (
                            <li key={index}>
                                <span>Break {index + 1}</span>
                                <span>{b.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal de Break */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Seleccionar tipo de Break</h3>
                        <select 
                            value={breakReason} 
                            onChange={(e) => setBreakReason(e.target.value)}
                            className="combo-box"
                        >
                            <option value="Políticas de la empresa">Políticas de la empresa</option>
                            <option value="Baño">Baño</option>
                            <option value="Comida">Comida</option>
                        </select>
                        <div className="modal-actions">
                            <button className="btn" onClick={handleStartBreak}>Comenzar Break</button>
                            <button className="btn cancel-btn" onClick={() => {
                                setIsModalOpen(false);
                                mainClock.start(); // Si cancela, reanuda el principal
                            }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}