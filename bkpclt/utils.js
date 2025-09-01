// js/modules/utils.js

export function generateId() {
    return crypto.randomUUID();
}

export function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        value = 0;
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatDate(isoDateString) {
    if (!isoDateString || !isoDateString.includes('-')) {
        return 'Data inválida';
    }
    // Lida tanto com 'YYYY-MM-DD' quanto com 'YYYY-MM-DDTHH:mm:ss.sssZ'
    const datePart = isoDateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}