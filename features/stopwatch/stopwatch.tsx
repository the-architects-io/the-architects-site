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

  const getFormattedTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    const parts = [
      hours > 0 ? `${hours}h` : "",
      minutes > 0 ? `${minutes}m` : "",
      seconds > 0 ? `${seconds}s` : "",
    ].filter((part) => part !== "");

    return parts.join(" ");
  };

  return (
    <div>
      <span>{getFormattedTime(elapsedTime)}</span>
    </div>
  );
};

export default Stopwatch;
