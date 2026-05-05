import React, { useState } from 'react';
import './App.css';
import logoArgos from './assets/logo192.png'; 
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OpsForm, { OperationData } from './components/OpsForm';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(''); 
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'OPS_FORM'>('DASHBOARD');

  // Estado del usuario autenticado
  const [loggedUsername, setLoggedUsername] = useState<string>('');
  
  // Memoria de Operaciones
  const [operationsList, setOperationsList] = useState<OperationData[]>([]);

  const [userRole, setUserRole] = useState<string>('');

  

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab(''); 
    setCurrentView('DASHBOARD');
    setLoggedUsername('');
    setUserRole(''); // Limpiamos el rol al salir
  };

  // Guardar nueva operación
  const handleSaveOperation = (newOp: OperationData) => {
    setOperationsList([...operationsList, newOp]);
    setCurrentView('DASHBOARD');
  };

  // Borrar operación (ícono bote de basura)
  const handleDeleteOperation = (id: string) => {
    setOperationsList(operationsList.filter(op => op.idSignature !== id));
  };

  // Cerrar operación (modal de alarma) - Por ahora la borraremos visualmente, 
  // después aquí mandarás el fetch a tu API para marcarla como completada.
  // Cerrar operación con la BD Real
  const handleCloseOperation = async (idSignature: string) => {
    try {
      const response = await fetch(`https://192.168.3.117:444/api/Operations/close/${idSignature}`, {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
      });

      const data = await response.json();

    if (response.ok) {
      // 2. Si el servidor respondió OK, actualizamos el estado en React
      // Quitamos la operación de la lista actual (porque ya no está "Abierta")
      setOperationsList(prevList => prevList.filter(op => op.idSignature !== idSignature));
      
      console.log("Operación cerrada con éxito en SQL Server:", data.finishTime);
    } else {
      // 3. Si el servidor detectó un error (ej. ya estaba cerrada)
      alert(data.message || "Error al intentar cerrar la operación.");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor para cerrar la operación.");
  }
};

  const getWindowTitle = () => {
    if (!isLoggedIn) return 'Iniciar Sesión';
    if (currentView === 'OPS_FORM') return 'Slice Open Ops Form';
    if (activeTab === 'operaciones') return 'Operaciones';
    return ''; 
  };

  // Dentro de App.tsx, crea esta función:
const fetchMyOperations = async (username: string) => {
  try {
    const response = await fetch(`https://192.168.3.117:444/api/Operations/my-active/${username}`);
    if (response.ok) {
      const data = await response.json();
      setOperationsList(data); // Llenamos la lista con lo que hay en SQL Server
    }
  } catch (error) {
    console.error("Error al cargar mis operaciones:", error);
  }
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
          <Login onLoginSuccess={(user, role) => { 
            setIsLoggedIn(true); 
            setLoggedUsername(user);
            setUserRole(role);
            if(role === 'Operador') {
              fetchMyOperations(user); // <--- Llamamos a la función que creamos arriba
            }
          }} />
        ) : currentView === 'DASHBOARD' ? (

         // AQUÍ OCURRE LA MAGIA DEL ENRUTAMIENTO POR ROL
          userRole === 'Admin' ? (
            <AdminDashboard />
          ) : (
            <Dashboard 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onOpenForm={() => setCurrentView('OPS_FORM')} 
              operations={operationsList}
              onDeleteOp={handleDeleteOperation}
              onCloseOp={handleCloseOperation}
            />
          )
          
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