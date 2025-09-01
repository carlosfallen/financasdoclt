export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    value = 0;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (isoDateString: string): string => {
  if (!isoDateString || !isoDateString.includes('-')) {
    return 'Data inválida';
  }
  const datePart = isoDateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export const generateId = (): string => {
  return crypto.randomUUID();
};