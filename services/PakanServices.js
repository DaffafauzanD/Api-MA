//#region Simple Moving Average Forecasting Service oldVersion

/**
 * Calculate Simple Moving Average forecast
 * @param {Array} data - Time series data array
 * @param {Number} window - Window size for moving average
 * @param {Number} forecastPeriods - Number of periods to forecast
 * @returns {Array} - Forecast values for requested periods
 */
// function smaForecast(data, window, forecastPeriods) {
//   // Validate input
//   if (data.length < window) {
//     throw new Error(`Not enough data points. Need at least ${window} points.`);
//   }
  
//   const forecast = [];
  
//   // Generate forecast for each period
//   for (let i = 0; i < forecastPeriods; i++) {
//     // For each forecast period, use the last 'window' actual values or forecasted values
//     const startIdx = data.length + i - window;
//     const endIdx = data.length + i;
    
//     // Collect the values to use for this forecast point
//     const valuesToUse = [];
    
//     for (let j = startIdx; j < endIdx; j++) {
//       if (j < data.length) {
//         // Use actual data
//         valuesToUse.push(data[j]);
//       } else {
//         // Use previously forecasted data
//         valuesToUse.push(forecast[j - data.length]);
//       }
//     }
    
//     // Calculate the moving average
//     const sum = valuesToUse.reduce((acc, val) => acc + val, 0);
//     const average = sum / window;
    
//     // Add to forecast
//     forecast.push(Math.round(average));
//   }
  
//   return forecast;
// }

/**
 * Calculate SMA forecast for feed consumption data
 * @param {Array} monthlyData - Array of monthly feed data objects
 * @param {String} field - The field to forecast (e.g., 'pakan_bulan')
 * @param {Number} window - The window size for moving average
 * @param {Number} periods - Number of periods to forecast
 * @returns {Object} - Original data and forecast values
 */
// function forecastFeedConsumption(monthlyData, field, window, periods) {
//   // Extract the field values
//   const values = monthlyData.map(item => item[field]);
  
//   // Calculate forecast
//   const forecastValues = smaForecast(values, window, periods);
  
//   // Format the forecast results
//   const lastMonth = monthlyData.length;
//   const forecast = forecastValues.map((value, index) => {
//     return {
//       month: lastMonth + index + 1,
//       [field]: value,
//       is_forecast: true
//     };
//   });
  
//   return {
//     actual: monthlyData,
//     forecast: forecast
//   };
// }

//#endregion Simple Moving Average Forecasting Service oldVersion

const PakanModel = require("../model/PakanModel");

async function getAllPakan() {
  return await PakanModel.getAllPakan();
}

async function getAllPakanMonthly() {
  return await PakanModel.getAllPakanMonthly();
}

async function processMonthlyProductionPakan() {
  return await PakanModel.processMonthlyProductionPakan
}

async function createProduksiPakan(data) {
  return await PakanModel.createProduksiPakan(data);
}

async function updateProduksiPakan(id, data) {
  return await PakanModel.updateProduksiPakan(id, data);
}

async function deleteProduksiPakan(id) {
  return await PakanModel.deleteProduksiPakan(id);
}


async function createBulkProduksiPakan(dataArray) {
    return await Produksitelur.createBulkProduksiPakan(dataArray);
}




module.exports = {
  getAllPakan,
  getAllPakanMonthly,
  processMonthlyProductionPakan,
  createProduksiPakan,
  updateProduksiPakan,
  deleteProduksiPakan,
  createBulkProduksiPakan
  
  // Uncomment the following lines if you want to use the SMA forecast functionality
  
  // smaForecast,
  // forecastFeedConsumption
};