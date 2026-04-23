import React, { useState, useEffect } from 'react';
import './App.css'; 
import Selector from './components/Selector'; 
import Tracker from './components/Tracker'; 

// 1. Le decimos a TypeScript que 'window' puede tener la propiedad 'deferredPrompt'
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

function App() {
  const [vistaActual, setVistaActual] = useState<'SELECTOR' | 'TRACKER'>('SELECTOR');
  const [operacionActiva, setOperacionActiva] = useState<string | null>(null);
  
  // 2. Estado para mostrar u ocultar el botón de instalación
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);

  // 3. Capturamos el evento de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      window.deferredPrompt = event;
      setIsReadyForInstall(true); // Mostramos el botón
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // 4. Función que se ejecuta al presionar "Descargar App"
  const downloadApp = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    console.log("Elección del usuario:", result);
    
    window.deferredPrompt = null;
    setIsReadyForInstall(false);
  };

  const handleStartOperation = (operacion: string) => {
    setOperacionActiva(operacion);
    setVistaActual('TRACKER');
  };

  const handleVolver = () => {
    setOperacionActiva(null);
    setVistaActual('SELECTOR');
  };

  return (
    <div className="App">
      {/* Botón global de instalación de PWA */}
      {isReadyForInstall && (
        <div style={{ background: '#0d6efd', color: 'white', padding: '10px', textAlign: 'center' }}>
          ¿Quieres instalar el Time Tracker? 
          <button onClick={downloadApp} style={{ marginLeft: '10px', cursor: 'pointer' }}>
            Instalar App
          </button>
        </div>
      )}

      {vistaActual === 'SELECTOR' && (
        <Selector onStartOperation={handleStartOperation} />
      )}

      {vistaActual === 'TRACKER' && operacionActiva && (
        <Tracker 
          operationName={operacionActiva} 
          onBack={handleVolver} 
        />
      )}
    </div>
  );
}

export default App;