import { useState, useEffect, useRef } from 'react';

export const useStopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 10);
            }, 10);
        } else if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    const reset = () => {
        setIsRunning(false);
        setTime(0);
    };

    // Formateador de tiempo a HH:MM:SS.ms
    const formattedTime = () => {
        const hours = Math.floor((time / 3600000) % 24).toString().padStart(2, '0');
        const minutes = Math.floor((time / 60000) % 60).toString().padStart(2, '0');
        const seconds = Math.floor((time / 1000) % 60).toString().padStart(2, '0');
        const milliseconds = Math.floor((time % 1000) / 10).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    return { time, isRunning, start, pause, reset, formattedTime };
};