// src/utils/formatters.ts

export const generateId = (): string => {
  // usa randomUUID quando disponível
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    // @ts-ignore - alguns tsconfig não reconhecem randomUUID no tipo Crypto
    return (globalThis.crypto as any).randomUUID();
  }

  // gera UUIDv4 via getRandomValues
  if (typeof globalThis.crypto !== 'undefined' && 'getRandomValues' in globalThis.crypto) {
    const bytes = (globalThis.crypto as Crypto).getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // versão 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC4122

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`;
  }

  // fallback final (não-UUID, mas único o bastante para IDs locais)
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
};


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
  
  // Lida tanto com 'YYYY-MM-DD' quanto com 'YYYY-MM-DDTHH:mm:ss.sssZ'
  const datePart = isoDateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const parseNumber = (value: string): number => {
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthName = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
};