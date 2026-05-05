import React, { useState } from 'react';

interface LoginProps {
  // Ahora mandamos también el rol
  onLoginSuccess: (username: string, role: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://192.168.3.117:81/api/Account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: usuario, password: password }),
        credentials: 'include' 
      });

      if (response.ok) {
        // Extraemos el JSON con el rol que nos mandó .NET
        const data = await response.json();
        onLoginSuccess(data.username, data.role);
      } else {
        const errorText = await response.text();
        setError(errorText || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-container">
      <p className="login-description">Ingresa tus credenciales para continuar</p>

      <form onSubmit={handleLogin}>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <div className="form-group">
          <label>Usuario <span>*</span></label>
          <input type="text" className="form-control" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Contraseña <span>*</span></label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div className="bottom-btn-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="submit" className="btn-primary">Iniciar Sesión</button>

          
        </div>
      </form>
    </div>
  );
}