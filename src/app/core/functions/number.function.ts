export function generarCodigoNumerico() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function gradosARadianes(grados: number) {
  return grados * (Math.PI / 180);
}