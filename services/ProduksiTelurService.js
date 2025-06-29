const Produksitelur = require('../model/ProduksiTelurModel');

async function getAllProduksiTelur() {
    return await Produksitelur.getAllProduksiTelur();
}

async function createProduksiTelur(data) {
    return await Produksitelur.createProduksiTelur(data);
}
async function updateProduksiTelur(id, data) {
    return await Produksitelur.updateProduksiTelur(id, data);
}
async function deleteProduksiTelur(id) {
    return await Produksitelur.deleteProduksiTelur(id);
}

async function getProduksiTelurById(id) {
    return await Produksitelur.getProduksiTelurById(id);
}

async function processMonthlyProduction() {
    return await Produksitelur.processMonthlyProduction();
}

async function getAllMonthlyProduction() {
    return await Produksitelur.getAllMonthlyProduction();
}

async function createBulkProduksiTelur(dataArray) {
    return await Produksitelur.createBulkProduksiTelur(dataArray);
}

async function getWeeklyProduction() {
    return await Produksitelur.getWeeklyProduction();
}

async function getQuarterlyProduction(){
    return await Produksitelur.getQuarterlyProduction();
}


module.exports = {
    getAllProduksiTelur,
    getProduksiTelurById,
    createProduksiTelur,
    updateProduksiTelur,
    processMonthlyProduction,
    getAllMonthlyProduction,
    deleteProduksiTelur,
    createBulkProduksiTelur,
    getWeeklyProduction,
    getQuarterlyProduction
};