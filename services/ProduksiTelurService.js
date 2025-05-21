const Produksitelur = require('../model/ProduksiTelurModel');

async function getAllProduksiTelur() {
    return await Produksitelur.getAllProduksiTelur();
}
async function getProduksiTelurById(id) {
    return await Produksitelur.getProduksiTelurById(id);
}

module.exports = {
    getAllProduksiTelur,
    getProduksiTelurById,
};