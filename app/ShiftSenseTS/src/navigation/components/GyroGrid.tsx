import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

type GyroGridProps = {
  forward: number;
  lateral: number;
  maxAccel?: number;
  size?: number;
};

export function GyroGrid({
  forward,
  lateral,
  maxAccel = 6,
  size = 260,
}: GyroGridProps) {
  const dotPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const half = size / 2;
    const pxPerMs2 = half / maxAccel;

    const displayX = Math.max(-half, Math.min(half, lateral * pxPerMs2));
    const displayY = Math.max(-half, Math.min(half, forward * pxPerMs2));

    Animated.spring(dotPos, {
      toValue: { x: displayX, y: -displayY },
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  }, [forward, lateral, size, maxAccel]);

  return (
    <View style={[styles.grid, { width: size, height: size }]}>
      <View style={styles.crosshairHorizontal} />
      <View style={styles.crosshairVertical} />
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [
              { translateX: dotPos.x },
              { translateY: dotPos.y },
            ],
            left: size / 2 - 8,
            top: size / 2 - 8,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  crosshairHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#ddd',
  },
  crosshairVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: '#ddd',
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff3b30',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
