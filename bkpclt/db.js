// js/modules/db.js

const DB_KEY = 'CLT_FINANCEIRO_DATA';

function getInitialData() {
    return {
        user: null,
        accounts: [],
        transactions: [],
        schedules: [],
        benefits: [],
        budgets: [],
        goals: [],
        installments: [],
        shoppingLists: [], // NOVA COLEÇÃO
    };
}

function loadDatabase() {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
        let parsedData = JSON.parse(data);
        const initialData = getInitialData();
        
        // Garante que todas as chaves do modelo de dados mais recente existem
        for (const key in initialData) {
            if (!parsedData.hasOwnProperty(key)) {
                parsedData[key] = initialData[key];
            }
        }
        
        // Lógicas de migração para garantir a estabilidade
        if (parsedData.benefits && parsedData.benefits.length > 0) {
            parsedData.benefits.forEach(b => {
                if (typeof b.inCash === 'undefined') {
                    b.inCash = false;
                }
            });
        }
        if (parsedData.schedules && parsedData.schedules.length > 0) {
            parsedData.schedules.forEach(s => {
                if (!s.hasOwnProperty('payments')) {
                    s.payments = [];
                }
            });
        }
        if (parsedData.installments && parsedData.installments.length > 0) {
            parsedData.installments.forEach(item => {
                if (!item.hasOwnProperty('payments')) {
                    item.payments = [];
                    if (item.paidInstallments > 0) {
                        for (let i = 1; i <= item.paidInstallments; i++) {
                            item.payments.push({ installmentNumber: i, transactionId: 'migrated' });
                        }
                    }
                }
            });
        }
        return parsedData;
    }
    const freshData = getInitialData();
    saveDatabase(freshData);
    return freshData;
}

function saveDatabase(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const db = loadDatabase();

export function getData(key) {
    return db[key];
}

export function setData(key, value) {
    db[key] = value;
    saveDatabase(db);
}

export function addItem(collectionName, item) {
    if (db[collectionName] && Array.isArray(db[collectionName])) {
        db[collectionName].push(item);
        saveDatabase(db);
    }
}

export function updateItem(collectionName, itemId, updatedProperties) {
    if (db[collectionName] && Array.isArray(db[collectionName])) {
        const itemIndex = db[collectionName].findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            db[collectionName][itemIndex] = { ...db[collectionName][itemIndex], ...updatedProperties };
            saveDatabase(db);
        }
    }
}

export function deleteItem(collectionName, itemId) {
    if (db[collectionName] && Array.isArray(db[collectionName])) {
        db[collectionName] = db[collectionName].filter(item => item.id !== itemId);
        saveDatabase(db);
    }
}

export function resetDatabase() {
    localStorage.removeItem(DB_KEY);
    window.location.hash = '#features';
    window.location.reload();
}