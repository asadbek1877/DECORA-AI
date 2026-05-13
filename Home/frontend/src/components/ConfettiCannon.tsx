import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('screen');

interface Particle {
  id: number;
  left: Animated.Value;
  top: Animated.Value;
  rotation: Animated.Value;
  opacity: Animated.Value;
}

export function ConfettiCannon({ duration = 3000, particles = 50 }: { duration?: number; particles?: number }) {
  const [particleList, setParticleList] = React.useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particles; i++) {
      const id = i;
      const particle: Particle = {
        id,
        left: new Animated.Value(width / 2),
        top: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };
      newParticles.push(particle);

      // Animate each particle
      const startX = Math.random() * width - width / 2;
      const startY = Math.random() * height;
      const randomDuration = Math.random() * 1000 + duration / 2;

      Animated.parallel([
        Animated.timing(particle.left, {
          toValue: startX,
          duration: randomDuration,
          useNativeDriver: false,
        }),
        Animated.timing(particle.top, {
          toValue: height,
          duration: randomDuration,
          useNativeDriver: false,
        }),
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 720,
          duration: randomDuration,
          useNativeDriver: false,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: randomDuration,
          useNativeDriver: false,
        }),
      ]).start();
    }

    setParticleList(newParticles);

    // Cleanup
    const timer = setTimeout(() => {
      setParticleList([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, particles]);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particleList.map((particle) => {
        const color = colors[particle.id % colors.length];
        const rotationInterpolate = particle.rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.left,
                top: particle.top,
                opacity: particle.opacity,
                transform: [{ rotate: rotationInterpolate }],
                backgroundColor: color,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
});
