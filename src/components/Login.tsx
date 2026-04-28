import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Apuntamos a tu controlador de .NET
      const response = await fetch('https://localhost:7021/api/Account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // 2. Mandamos el JSON tal como lo espera tu LoginModel
        body: JSON.stringify({ 
          login: usuario, 
          password: password 
        }),
        // 3. ¡CRÍTICO! Esto permite que el navegador guarde la cookie de Identity
        credentials: 'include' 
      });

      if (response.ok) {
  console.log("Login exitoso, cookie guardada.");
  onLoginSuccess(usuario); // <--- Mandamos el usuario
} else {
        // Leemos el error que manda tu Unauthorized() o BadRequest()
        const errorText = await response.text();
        setError(errorText || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error conectando al servidor:", err);
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-container">
      <p className="login-description">
        These options control the content and behavior of the app
      </p>

      <form onSubmit={handleLogin}>
        {/* Mostrar mensaje de error si falla el login */}
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

        <div className="bottom-btn-container">
          <button type="submit" className="btn-primary">
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  );
}