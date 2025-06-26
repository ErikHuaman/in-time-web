import { colors } from '@constants/preset';

export const listaColores = Object.keys(colors).flatMap((key: any) => {
  const color = colors[key];
  return Object.keys(color)
    .map((k) => parseInt(k))
    .filter((k: number) => {
      return [100, 200, 300, 400, 500, 600, 700].includes(k);
    })
    .map((k: number) => ({
      key: k,
      bgColor: mixWithTransparent(color[k], 0.9),
      borderColor: darkenHexColor(color[k + 100], 0.75),
      textColor:
        k > 300
          ? mixWithTransparent(color[50], 1)
          : darkenHexColor(color[k + 200], 0.75),
    }));
});

export function hexToRgba(hex: string, alpha: number = 1) {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b, a: alpha };
}

export function mixWithTransparent(hexColor: string, factor: number) {
  const rgba = hexToRgba(hexColor);
  const newAlpha = factor;

  // Esto simula mezclar con transparente, manteniendo el color pero reduciendo opacidad
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${newAlpha})`;
}

export function darkenHexColor(color: string, factor: number): string {
  // Validar si el color tiene un formato hexadecimal válido
  const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
  if (!hexRegex.test(color)) {
    throw new Error(
      'El color debe estar en formato hexadecimal (#RRGGBB o #RGB)'
    );
  }

  // Expandir formato corto (#RGB a #RRGGBB)
  let hex = color.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Convertir a valores decimales y aplicar el factor de oscurecimiento
  const r = Math.floor(parseInt(hex.slice(0, 2), 16) * factor);
  const g = Math.floor(parseInt(hex.slice(2, 4), 16) * factor);
  const b = Math.floor(parseInt(hex.slice(4, 6), 16) * factor);

  // Asegurarse de que los valores estén entre 0 y 255
  const clamp = (value: number) => Math.max(0, Math.min(255, value));

  // Convertir de vuelta a hexadecimal
  const darkHex = [clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, '0')) // Convertir a hex y agregar ceros iniciales si es necesario
    .join('');

  return `#${darkHex}`;
}

export function rgbaToHex(r: number, g: number, b: number, a: number = 1) {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const alpha = toHex(a * 255);

  return '#' + toHex(r) + toHex(b) + toHex(g) + (a < 1 ? alpha : '');
}
