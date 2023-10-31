import React, { useState, useEffect } from "react";

interface StopwatchProps {
  start: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({ start }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: any;

    if (start) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [start]);

  return (
    <div>
      <span>{elapsedTime} seconds</span>
    </div>
  );
};

export default Stopwatch;
