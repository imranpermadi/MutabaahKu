/**
 * Menghitung sudut arah kiblat (azimuth) dari koordinat lintang & bujur pengguna
 * menuju Ka'bah di Makkah (Lat: 21.422487, Lon: 39.826206)
 * menggunakan rumus Great-Circle Spherical Trigonometry.
 */
export function calculateQiblaBearing(lat: number, lon: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lon * Math.PI) / 180;
  const phiK = (21.422487 * Math.PI) / 180; // Titik Lintang Ka'bah
  const lambdaK = (39.826206 * Math.PI) / 180; // Titik Bujur Ka'bah

  const dLambda = lambdaK - lambda1;
  const y = Math.sin(dLambda);
  const x = Math.cos(phi1) * Math.tan(phiK) - Math.sin(phi1) * Math.cos(dLambda);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Memeriksa apakah selisih sudut perangkat dan kiblat berada dalam toleransi target (+- 3 derajat)
 */
export function isAlignedWithQibla(deviceHeading: number, qiblaBearing: number, tolerance: number = 3): boolean {
  let diff = Math.abs(deviceHeading - qiblaBearing) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff <= tolerance;
}
