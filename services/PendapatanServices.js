const pendapatanModel = require('../model/PendapatanModel');

async function getAllPendapatan() {
    return await pendapatanModel.getAllPendapatan();
}

module.exports = {
    getAllPendapatan,
};