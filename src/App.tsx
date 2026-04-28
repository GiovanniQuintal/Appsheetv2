import React, { useState } from 'react';
import './App.css';
import logoArgos from './assets/logo192.png'; 
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OpsForm, { OperationData } from './components/OpsForm';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(''); 
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'OPS_FORM'>('DASHBOARD');

  // Estado del usuario autenticado
  const [loggedUsername, setLoggedUsername] = useState<string>('');
  
  // Memoria de Operaciones
  const [operationsList, setOperationsList] = useState<OperationData[]>([]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab(''); 
    setCurrentView('DASHBOARD');
    setLoggedUsername('');
  };

  // Guardar nueva operación
  const handleSaveOperation = (newOp: OperationData) => {
    setOperationsList([...operationsList, newOp]);
    setCurrentView('DASHBOARD');
  };

  // Borrar operación (ícono bote de basura)
  const handleDeleteOperation = (id: string) => {
    setOperationsList(operationsList.filter(op => op.id !== id));
  };

  // Cerrar operación (modal de alarma) - Por ahora la borraremos visualmente, 
  // después aquí mandarás el fetch a tu API para marcarla como completada.
  const handleCloseOperation = (id: string) => {
    setOperationsList(operationsList.filter(op => op.id !== id));
  };

  const getWindowTitle = () => {
    if (!isLoggedIn) return 'Iniciar Sesión';
    if (currentView === 'OPS_FORM') return 'Slice Open Ops Form';
    if (activeTab === 'operaciones') return 'Operaciones';
    return ''; 
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        {currentView === 'OPS_FORM' ? (
          <button className="menu-btn" onClick={() => setCurrentView('DASHBOARD')}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        ) : (
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
        )}
        
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn && (
            <img 
              src={logoArgos} 
              alt="Logo Argos" 
              style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} 
            /> 
          )}
          <span>{getWindowTitle()}</span>
        </div>

        {isLoggedIn && currentView === 'DASHBOARD' && (
          <div className="topbar-actions">
            <i className="fa-solid fa-magnifying-glass"></i>
            {activeTab === 'operaciones' && (
              <i className="fa-regular fa-square-check"></i>
            )}
            <i className="fa-solid fa-arrow-rotate-right"></i>
          </div>
        )}
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <main className="main-content" style={{ padding: isLoggedIn && currentView === 'DASHBOARD' ? '0' : '0' }}>
        {!isLoggedIn ? (
          <Login onLoginSuccess={(user) => { 
            setIsLoggedIn(true); 
            setLoggedUsername(user); // Guardamos el usuario real
          }} />
        ) : currentView === 'DASHBOARD' ? (
          <Dashboard 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenForm={() => setCurrentView('OPS_FORM')} 
            operations={operationsList}
            onDeleteOp={handleDeleteOperation}
            onCloseOp={handleCloseOperation}
          />
        ) : (
          <OpsForm 
            username={loggedUsername} 
            onClose={() => setCurrentView('DASHBOARD')} 
            onSave={handleSaveOperation}
          />
        )}
      </main>
    </div>
  );
}

export default App;