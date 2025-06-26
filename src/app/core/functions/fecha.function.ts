export const getDiasDelMes = (
  fecha: Date
): { dia: number; nombre: string }[] => {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const diasDelMes: { dia: number; nombre: string }[] = [];

  const nombresDias = [
    'Do',
    'Lu',
    'Ma',
    'Mi',
    'Ju',
    'Vi',
    'Sa',
  ];
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
