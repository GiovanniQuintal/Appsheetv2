import React from 'react';
import logoArgos from '../assets/logo192.png'; 

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, isLoggedIn, onLogout }: SidebarProps) {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src={logoArgos} 
            alt="Logo Argos" 
            style={{ width: '45px', height: '45px', objectFit: 'contain', marginRight: '10px' }} 
          /> 
          jobsigner
        </div>
        
        <ul className="sidebar-nav">
          {!isLoggedIn ? (
            <li className="active">
              <i className="fa-solid fa-key"></i> Iniciar Sesión
            </li>
          ) : (
            <li onClick={() => { onLogout(); onClose(); }} style={{ color: '#dc3545' }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
            </li>
          )}
          
          <li><i className="fa-solid fa-circle-info"></i> About</li>
          <li><i className="fa-solid fa-share-nodes"></i> Share</li>
          <li><i className="fa-solid fa-table-cells-large"></i> App Gallery</li>
          <li><i className="fa-solid fa-thumbtack"></i> Add Shortcut</li>
        </ul>
      </div>
    </>
  );
}