import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7021/api/Account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          login: usuario, 
          password: password 
        }),
        credentials: 'include' 
      });

      if (response.ok) {
        console.log("Login exitoso, cookie guardada.");
        onLoginSuccess(usuario);
      } else {
        const errorText = await response.text();
        setError(errorText || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error conectando al servidor:", err);
      setError("Error de conexión con el servidor.");
    }
  };

  // --- NUEVA FUNCIÓN DE PRUEBA ---
  const handleBypass = () => {
    // Entramos directamente sin consultar al servidor
    onLoginSuccess("Operador de Prueba"); 
  };

  return (
    <div className="login-container">
      <p className="login-description">
        These options control the content and behavior of the app
      </p>

      <form onSubmit={handleLogin}>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <div className="form-group">
          <label>Usuario <span>*</span></label>
          <input 
            type="text" 
            className="form-control" 
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña <span>*</span></label>
          <input 
            type="password" 
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* CONTENEDOR DE BOTONES ACTUALIZADO */}
        <div className="bottom-btn-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <button type="submit" className="btn-primary">
            Iniciar Sesión
          </button>

          {/* BOTÓN DE PRUEBA (Gris para diferenciarlo) */}
          <button 
            type="button" 
            className="btn-primary" 
            style={{ backgroundColor: '#6c757d' }} 
            onClick={handleBypass}
          >
            Modo Prueba (Bypass)
          </button>

        </div>
      </form>
    </div>
  );
}