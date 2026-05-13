import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface CountdownTimerProps {
  targetDate: string | null;
  style?: TextStyle | TextStyle[];
  onExpire?: () => void;
}

export default function CountdownTimer({ targetDate, style, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Refilling now...');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const format = (num: number) => num.toString().padStart(2, '0');
      setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };

    calculateTimeLeft(); // Initial call
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (!targetDate || !timeLeft) return null;

  return <Text style={style}>{timeLeft}</Text>;
}
