import React, { useState } from 'react';
import './App.css';
import Selector from './components/Selector';
import Tracker from './components/Tracker';

function App() {
    const [currentScreen, setCurrentScreen] = useState("SELECTOR"); // 'SELECTOR' | 'TRACKER'
    const [activeOperation, setActiveOperation] = useState(null);

    const handleStartOperation = (operation) => {
        setActiveOperation(operation);
        setCurrentScreen("TRACKER");
    };

    return (
        <div className="App">
            {currentScreen === "SELECTOR" ? (
                <Selector onStartOperation={handleStartOperation} />
            ) : (
                <Tracker 
                    operationName={activeOperation} 
                    onBack={() => setCurrentScreen("SELECTOR")} 
                />
            )}
        </div>
    );
}

export default App;