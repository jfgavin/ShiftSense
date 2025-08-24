import { View, Text, StyleSheet } from 'react-native';
import { Header } from '@react-navigation/elements';
import { useMotionData } from '../utils/useMotionData';
import { GyroGrid } from '../components/GyroGrid';

export function GyroViewer() {
  const { accel, gyro, linearAccel, angles } = useMotionData();

  return (
    <View style={styles.container}>
      <Header title="Gyro Screen" />
      <GyroGrid forward={linearAccel.forward} lateral={linearAccel.lateral} />

      <Text>Accelerometer: {JSON.stringify(accel)}</Text>
      <Text>Gyroscope: {JSON.stringify(gyro)}</Text>
      <Text>Linear Accel: {JSON.stringify(linearAccel)}</Text>
      <Text>
        Pitch: {(angles.pitch * 180 / Math.PI).toFixed(1)}°, 
        Roll: {(angles.roll * 180 / Math.PI).toFixed(1)}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingTop: 20,
  },
});
