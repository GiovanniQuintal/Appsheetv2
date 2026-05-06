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

// 👈 AÑADIMOS LA INTERFAZ DE PROPS PARA RECIBIR onOpenForm
interface AdminDashboardProps {
  onOpenForm: () => void;
}

export default function AdminDashboard({ onOpenForm }: AdminDashboardProps) {
  const [operations, setOperations] = useState<ActiveOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opToClose, setOpToClose] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [opToDelete, setOpToDelete] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

  // 👇 ESTADOS PARA EL MODAL DE USUARIOS
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userMsg, setUserMsg] = useState({ text: '', isError: false });
  
  const [newUser, setNewUser] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    role: 'Operador' // Por defecto
  });

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

  const handleCloseOperation = async (idSignature: string) => {
    setIsClosing(true);
    try {
      const response = await fetch(`https://192.168.3.117:444/api/Operations/close/${idSignature}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
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

  const handleDeleteOperation = async (idSignature: string) => {
  setIsDeleting(true);
  try {
    const response = await fetch(`https://192.168.3.117:444/api/Operations/delete/${idSignature}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      setOperations(prev => prev.filter(op => op.idSignature !== idSignature));
    } else {
      alert("Error al eliminar la operación.");
    }
  } catch (error) {
    alert("No se pudo conectar con el servidor.");
  } finally {
    setIsDeleting(false);
    setOpToDelete(null);
  }
};

  // 👇 FUNCIÓN PARA REGISTRAR USUARIO Y ASIGNAR ROL
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    setUserMsg({ text: '', isError: false });

    try {
      // 1. Crear el usuario
      const regResponse = await fetch('https://192.168.3.117:444/api/Account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: newUser.fullName,
          UserName: newUser.userName,
          Email: newUser.email,
          Password: newUser.password
        })
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.text();
        setUserMsg({ text: errorData || "Error al crear el usuario.", isError: true });
        setIsSavingUser(false);
        return;
      }

      // 2. Asignar el Rol llamando al endpoint de RolesController
      const roleResponse = await fetch(`https://192.168.3.117:444/api/Roles/assign-role?username=${newUser.userName}&roleName=${newUser.role}`, {
        method: 'POST'
      });

      if (roleResponse.ok) {
        setUserMsg({ text: `Usuario ${newUser.userName} creado como ${newUser.role} exitosamente.`, isError: false });
        // Limpiar formulario tras éxito
        setNewUser({ fullName: '', userName: '', email: '', password: '', role: 'Operador' });
        setTimeout(() => {
          setIsUserModalOpen(false);
          setUserMsg({ text: '', isError: false });
        }, 2000);
      } else {
        setUserMsg({ text: "Usuario creado, pero hubo un error al asignar el rol.", isError: true });
      }

    } catch (error) {
      setUserMsg({ text: "Error de conexión con el servidor.", isError: true });
    } finally {
      setIsSavingUser(false);
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
              <th>Acción</th>
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
                  <td>
                    <button
                      onClick={() => setOpToClose(op.idSignature)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.1rem' }}
                      title="Cerrar operación"
                    >
                      <i className="fa-solid fa-circle-stop"></i>
                    </button>
<button
  onClick={() => setOpToDelete(op.idSignature)}
  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', fontSize: '1.1rem', marginLeft: '10px' }}
  title="Eliminar registro"
>
  <i className="fa-solid fa-trash-can"></i>
</button>



                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 👇 BOTONES FLOTANTES (FABs) PARA EL ADMIN */}
      {/* Botón Izquierdo: Agregar Usuario */}
      <button 
        className="fab-button" 
        style={{ left: '20px', right: 'auto', backgroundColor: '#198754' }} 
        onClick={() => setIsUserModalOpen(true)}
        title="Crear Usuario"
      >
        <i className="fa-solid fa-user-plus"></i>
      </button>

      {/* Botón Derecho: Agregar Operación */}
      <button 
        className="fab-button" 
        onClick={onOpenForm}
        title="Nueva Operación"
      >
        <i className="fa-solid fa-plus"></i>
      </button>


      {/* --- MODAL CONFIRMACIÓN CIERRE OPERACIÓN --- */}
      {opToClose && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-title">Confirmar cierre</div>
            <div className="confirm-body">¿Estás seguro de cerrar esta operación como administrador?</div>
            <div className="confirm-actions">
              <button className="confirm-btn" onClick={() => setOpToClose(null)} disabled={isClosing}>NO</button>
              <button className="confirm-btn" onClick={() => handleCloseOperation(opToClose)} disabled={isClosing}>
                {isClosing ? 'Cerrando...' : 'CERRAR OPERACIÓN'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* MODAL ELIMINAR ADMIN */}
      {opToDelete && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-title" style={{ color: '#dc3545' }}>Eliminar Registro</div>
            <div className="confirm-body">¿Estás seguro de borrar esta operación de la base de datos?</div>
            <div className="confirm-actions">
              <button className="confirm-btn" onClick={() => setOpToDelete(null)} disabled={isDeleting}>NO</button>
              <button className="confirm-btn" style={{ color: '#dc3545' }} onClick={() => handleDeleteOperation(opToDelete)} disabled={isDeleting}>
                {isDeleting ? 'Borrando...' : 'ELIMINAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE REGISTRO DE USUARIOS --- */}
      {isUserModalOpen && (
        <div className="full-modal">
          <div className="modal-header">
            Alta de Usuario
            <button style={{background:'none', border:'none', color:'white', fontSize:'1.2rem', cursor:'pointer'}} onClick={() => setIsUserModalOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
            {userMsg.text && (
              <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: userMsg.isError ? '#f8d7da' : '#d1e7dd', color: userMsg.isError ? '#842029' : '#0f5132' }}>
                {userMsg.text}
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="appsheet-form">
              <div className="form-group">
                <label className="form-label">Nombre Completo <span>*</span></label>
                <div className="form-input-container">
                  <input type="text" required value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username <span>*</span></label>
                <div className="form-input-container">
                  <input type="text" required value={newUser.userName} onChange={e => setNewUser({...newUser, userName: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico <span>*</span></label>
                <div className="form-input-container">
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña <span>*</span></label>
                <div className="form-input-container">
                  <input type="password" required minLength={6} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Rol <span>*</span></label>
                <div className="form-input-container">
                  <select 
                    style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#333' }}
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Operador">Operador</option>
                    <option value="Supervisor">Supervisor (Admin)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-cancelar" onClick={() => setIsUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar" disabled={isSavingUser}>
                  {isSavingUser ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}