import {useEffect, useState} from 'react';
import {accelerometer, gyroscope, orientation, SensorTypes, setUpdateIntervalForType} from 'react-native-sensors';

export type MotionAngles = {
  pitch: number; roll: number
};
export type MotionAccel = {
  x: number; y: number; z: number
};
export type LinearAccel = {
  forward: number; lateral: number
};

export function useMotionData(updateMs: number = 50) {
  const [accel, setAccel] = useState<MotionAccel>({x: 0, y: 0, z: 0});
  const [gyro, setGyro] = useState<MotionAccel>({x: 0, y: 0, z: 0});
  const [linearAccel, setLinearAccel] = useState<LinearAccel>({
    forward: 0,
    lateral: 0,
  });
  const [angles, setAngles] = useState<MotionAngles>({pitch: 0, roll: 0});

  const gMag = 9.80665;

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, updateMs);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateMs);
    setUpdateIntervalForType(SensorTypes.orientation, updateMs);

    const accelSub = accelerometer.subscribe(a => setAccel(a));
    const gyroSub = gyroscope.subscribe(g => setGyro(g));

    const orientationSub = orientation.subscribe(o => {
      // Get the quaternion from the orientation sensor
      const {qx, qy, qz, qw} = o;

      // Convert quaternion to Euler angles (pitch and roll)
      const pitch = Math.asin(2.0 * (qw * qy - qz * qx));
      const roll = Math.atan2(
          2.0 * (qw * qx + qy * qz), 1.0 - 2.0 * (qx * qx + qy * qy));

      setAngles({pitch, roll});

      // Gravity vector in the world frame (assuming world z is up/down)
      const g_world = {x: 0, y: 0, z: -gMag};

      // Rotate the world gravity vector to the device's local frame
      const g_device =
          applyQuaternionToVector({x: qx, y: qy, z: qz, w: qw}, g_world);

      // Subtract the gravity component from the raw accelerometer data
      const linX = accel.x - g_device.x;
      const linY = accel.y - g_device.y;
      const linZ = accel.z - g_device.z;

      const forward = -linY;
      const lateral = linX;
      setLinearAccel({forward, lateral});
    });

    return () => {
      accelSub.unsubscribe();
      gyroSub.unsubscribe();
      orientationSub.unsubscribe();
    };
  }, [accel]);

  return {accel, gyro, linearAccel, angles};
}

// A helper function to apply a quaternion rotation to a vector
const applyQuaternionToVector = (q: any, v: any) => {
  const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
  const vx = v.x, vy = v.y, vz = v.z;

  const x = qw * vx + qy * vz - qz * vy;
  const y = qw * vy + qz * vx - qx * vz;
  const z = qw * vz + qx * vy - qy * vx;
  const w = -qx * vx - qy * vy - qz * vz;

  return {
    x: x * qw + w * -qx + y * -qz - z * -qy,
    y: y * qw + w * -qy + z * -qx - x * -qz,
    z: z * qw + w * -qz + x * -qy - y * -qx,
  };
};