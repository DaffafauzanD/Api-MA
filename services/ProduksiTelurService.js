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

module.exports = {
    getAllProduksiTelur,
    getProduksiTelurById,
    createProduksiTelur,
    updateProduksiTelur,
    deleteProduksiTelur
};