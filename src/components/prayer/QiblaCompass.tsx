import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateQiblaBearing, isAlignedWithQibla } from '../../lib/qibla';

interface QiblaCompassProps {
  latitude?: number;
  longitude?: number;
  cityName?: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  latitude = 3.5952,
  longitude = 98.6722,
  cityName = 'KOTA MEDAN'
}) => {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(292.8);
  const [hasSensor, setHasSensor] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  useEffect(() => {
    // Hitung sudut azimuth kiblat dari koordinat kota
    const angle = calculateQiblaBearing(latitude, longitude);
    setQiblaAngle(Math.round(angle * 10) / 10);
  }, [latitude, longitude]);

  // Pasang listener DeviceOrientationEvent
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS WebKit Compass
      if ((e as any).webkitCompassHeading !== undefined) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android / Standar
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        setHasSensor(true);
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const aligned = isAlignedWithQibla(deviceHeading, qiblaAngle, 3);

  // Trigger celebration saat aligned pertama kali
  useEffect(() => {
    if (aligned && !isCalibrated) {
      setIsCalibrated(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else if (!aligned && isCalibrated) {
      setIsCalibrated(false);
    }
  }, [aligned, isCalibrated]);

  return (
    <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base sm:text-lg font-black text-slate-800">
            Kompas Arah Ka'bah Ceria
          </h3>
        </div>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
          Target: {qiblaAngle}° ({cityName})
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium mt-2">
        Putar badanmu perlahan sampai jarum Ka'bah menyala hijau bersinar!
      </p>

      {/* Interactive Compass Dial */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Compass Outer Ring */}
          <div
            className={`w-full h-full rounded-full border-8 transition-colors duration-300 flex items-center justify-center relative shadow-inner ${
              aligned
                ? 'border-emerald-500 bg-emerald-50/50 shadow-emerald-200'
                : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-2 font-black text-xs text-rose-500">U (0°)</span>
            <span className="absolute right-3 font-bold text-xs text-slate-400">T (90°)</span>
            <span className="absolute bottom-2 font-bold text-xs text-slate-400">S (180°)</span>
            <span className="absolute left-3 font-bold text-xs text-slate-400">B (270°)</span>

            {/* Rotating Dial Container */}
            <motion.div
              animate={{ rotate: qiblaAngle - deviceHeading }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              {/* Ka'bah Pointer Arrow */}
              <div className="absolute top-5 flex flex-col items-center">
                {/* Cute Ka'bah SVG Icon */}
                <div className={`p-1.5 rounded-xl shadow-md transition-transform duration-200 ${
                  aligned ? 'bg-emerald-500 scale-110 ring-4 ring-emerald-300' : 'bg-slate-800'
                }`}>
                  <svg viewBox="0 0 32 32" className="w-6 h-6">
                    <rect x="4" y="6" width="24" height="22" rx="3" fill="#1E293B" />
                    <rect x="4" y="10" width="24" height="4" fill="#FBBF24" />
                    <rect x="18" y="18" width="6" height="10" rx="1" fill="#D97706" />
                  </svg>
                </div>
                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
                  aligned ? 'border-t-emerald-500' : 'border-t-slate-800'
                }`} />
                <span className={`text-[10px] font-black uppercase mt-0.5 ${
                  aligned ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  Ka'bah
                </span>
              </div>

              {/* Center Pivot Needle */}
              <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-white shadow-md z-10" />
            </motion.div>
          </div>
        </div>

        {/* Alignment Success Status */}
        {aligned ? (
          <div className="bg-emerald-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-chunky-emerald transition-all duration-300 ease-out transform scale-102">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Alhamdulillah! Kamu sudah tepat menghadap Kiblat!</span>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
            Arah saat ini: <span className="font-extrabold text-slate-800">{deviceHeading}°</span> (Selisih: {Math.abs(deviceHeading - qiblaAngle)}°)
          </div>
        )}

        {/* Simulation Slider (Untuk pengujian tanpa sensor giroskop di PC/Laptop) */}
        {!hasSensor && (
          <div className="w-full max-w-xs mt-4 pt-3 border-t border-slate-100 text-center">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Simulasi Putar Kompas (Mode Laptop/PC):
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={deviceHeading}
              onChange={(e) => setDeviceHeading(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">
              Geser ke <span className="font-bold text-emerald-700">{qiblaAngle}°</span> untuk menguji efek bersinar!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
