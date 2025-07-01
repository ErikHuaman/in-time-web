export const getDiasDelMes = (
  fecha: Date
): { dia: number; nombre: string }[] => {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const diasDelMes: { dia: number; nombre: string }[] = [];

  const nombresDias = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();

  for (let i = 1; i <= ultimoDia; i++) {
    const fechaActual = new Date(anio, mes, i);
    const nombreDia = nombresDias[fechaActual.getDay()];

    diasDelMes.push({
      dia: i,
      nombre: nombreDia,
    });
  }
  return diasDelMes;
};

export const getDateExcel = (fecha: number) => {
  const EXCEL_EPOCH_DIFF = 25569; // Días entre 1900-01-01 y 1970-01-01
  const SECONDS_IN_A_DAY = 86400;
  const LIMA_OFFSET_SECONDS = 5 * 3600; // 5 horas en segundos

  const utc_days_ini = Math.floor(fecha - EXCEL_EPOCH_DIFF);
  const utc_value_ini = utc_days_ini * SECONDS_IN_A_DAY + LIMA_OFFSET_SECONDS;
  return utc_value_ini;
};

export const diferenciaDias = (fecha1: Date, fecha2: Date): number => {
  // Obtener la diferencia en milisegundos
  const diferenciaMs = fecha2.getTime() - fecha1.getTime();

  // Convertir milisegundos a días
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.floor(diferenciaMs / msPorDia);
};
