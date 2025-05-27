/**
 * Calculate Simple Moving Average forecast
 * @param {Array} data - Time series data array (actual data for 12 months)
 * @param {Number} window - Window size for moving average (e.g., 4 months)
 * @returns {Array} - Forecast values for each month starting from the 5th month
 */
function smaForecast(data, window) {
  const forecast = [];

  // Iterate through the data starting from the `window` index
  for (let i = window; i < data.length; i++) {
    // Get the last `window` months of data
    const windowData = data.slice(i - window, i);

    // Calculate the moving average
    const sum = windowData.reduce((acc, val) => acc + val, 0);
    const average = sum / window;

    // Add the forecasted value
    forecast.push(parseFloat(average.toFixed(2))); // Round to 2 decimal places
  }

  return forecast;
}

/**
 * Calculate SMA forecast for monthly production data
 * @param {Array} monthlyData - Array of monthly data objects
 * @param {String} field - The field to forecast (e.g., 'total_telur_kg')
 * @param {Number} window - The window size for moving average
 * @returns {Object} - Original data and forecast values
 */
function forecastMonthlyProduction(monthlyData, field, window) {
  // Extract the field values for forecast calculation
  const values = monthlyData.map(item => item[field]);
  
  // Create forecast for all months starting from the window-th month
  const forecast = [];
  
  // For each month starting from the window-th month
  for (let i = window; i <= monthlyData.length; i++) {
    // Get the data for the current month
    const currentMonthData = monthlyData[i - 1];
    
    // Get the previous window months of data
    const previousWindowData = values.slice(i - window, i);
    
    // Calculate the moving average
    const sum = previousWindowData.reduce((acc, val) => acc + val, 0);
    const average = sum / window;
    const roundedAverage = parseFloat(average.toFixed(2));
    
    // Add forecast data point
    forecast.push({
      bulan: currentMonthData.bulan,
      tahun: currentMonthData.tahun,
      [field]: roundedAverage,
      is_forecast: true
    });
  }
  
  // Also forecast future months that don't have actual data
  // Get the last month's data
  const lastActualData = monthlyData[monthlyData.length - 1];
  let nextMonth = lastActualData.bulan;
  let nextYear = lastActualData.tahun;
  
  // Continue forecasting for future months (8-12)
  const combinedValues = [...values]; // Copy actual values
  
  // Forecast until month 12
  while (nextMonth < 12) {
    nextMonth++;
    
    // Get the most recent window-sized data
    const recentData = combinedValues.slice(-window);
    
    // Calculate moving average
    const sum = recentData.reduce((acc, val) => acc + val, 0);
    const average = sum / window;
    const roundedAverage = parseFloat(average.toFixed(2));
    
    // Add to forecast
    forecast.push({
      bulan: nextMonth,
      tahun: nextYear,
      [field]: roundedAverage,
      is_forecast: true
    });
    
    // Add to combined values for next calculation
    combinedValues.push(roundedAverage);
  }
  
  return {
    actual: monthlyData,
    forecast: forecast
  };
}

/**
 * Calculate combined forecast for multiple datasets
 * @param {Object} datasets - Object with different datasets
 * @param {Object} fields - Object mapping dataset keys to fields
 * @param {Number} window - Window size for moving average
 * @param {Number} periods - Number of periods to forecast
 * @returns {Object} - Forecasts for all datasets
 */
function forecastMultipleDatasets(datasets, fields, window, periods) {
  const results = {};
  
  // Process each dataset
  for (const key in datasets) {
    if (datasets.hasOwnProperty(key) && fields.hasOwnProperty(key)) {
      results[key] = forecastMonthlyProduction(
        datasets[key], 
        fields[key], 
        window, 
        periods
      );
    }
  }
  
  return results;
}

module.exports = {
  smaForecast,
  forecastMonthlyProduction,
  forecastMultipleDatasets
};