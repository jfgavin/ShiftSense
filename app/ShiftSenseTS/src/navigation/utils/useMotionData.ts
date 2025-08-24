import {useEffect, useRef, useState} from 'react';
import {accelerometer, gyroscope, SensorTypes, setUpdateIntervalForType,} from 'react-native-sensors';

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

  const lastTs = useRef<number|null>(null);
  const orientation = useRef<MotionAngles>({pitch: 0, roll: 0});

  const FILTER_ALPHA = 0.981;
  const gMag = 9.80665;

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, updateMs);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateMs);

    const accelSub = accelerometer.subscribe(a => {
      setAccel(a);
      processData(a, gyro);
    });

    const gyroSub = gyroscope.subscribe(g => {
      setGyro(g);
      processData(accel, g);
    });

    return () => {
      accelSub.unsubscribe();
      gyroSub.unsubscribe();
    };
  }, []);

  function processData(a: MotionAccel, g: MotionAccel) {
    const now = Date.now();
    if (!lastTs.current) lastTs.current = now;
    const dt = Math.max(1e-3, (now - lastTs.current) / 1000);
    lastTs.current = now;

    const ax = a.x || 0;
    const ay = a.y || 0;
    const az = a.z || 0;

    const rollAcc = Math.atan2(ay, az);
    const pitchAcc = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));

    const gx = g.x || 0;
    const gyv = g.y || 0;

    let pitch = orientation.current.pitch + gyv * dt;
    let roll = orientation.current.roll + gx * dt;

    pitch = FILTER_ALPHA * pitch + (1 - FILTER_ALPHA) * pitchAcc;
    roll = FILTER_ALPHA * roll + (1 - FILTER_ALPHA) * rollAcc;

    orientation.current.pitch = pitch;
    orientation.current.roll = roll;
    setAngles({pitch, roll});

    const g_x = gMag * Math.sin(pitch);
    const g_y = -gMag * Math.sin(roll);
    const g_z = gMag * Math.cos(pitch) * Math.cos(roll);

    const linX = ax - g_x;
    const linY = ay - g_y;
    const linZ = az - g_z;

    const forward = -linY;
    const lateral = linX;

    setLinearAccel({forward, lateral});
  }

  return {accel, gyro, linearAccel, angles};
}
