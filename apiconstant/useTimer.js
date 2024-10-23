import { useState, useEffect } from 'react';

export const useTimer = (initialTime) => {
  const [time, setTime] = useState(initialTime);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (time > 0) {
      const countdown = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setIsTimeUp(true);
    }
  }, [time]);

  const resetTimer = () => {
    setTime(initialTime);
    setIsTimeUp(false);
  };

  return { time, isTimeUp, resetTimer };
};

