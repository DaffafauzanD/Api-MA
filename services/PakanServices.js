/**
 * Calculate Simple Moving Average forecast
 * @param {Array} data - Time series data array
 * @param {Number} window - Window size for moving average
 * @param {Number} forecastPeriods - Number of periods to forecast
 * @returns {Array} - Forecast values for requested periods
 */
function smaForecast(data, window, forecastPeriods) {
  // Validate input
  if (data.length < window) {
    throw new Error(`Not enough data points. Need at least ${window} points.`);
  }
  
  const forecast = [];
  
  // Generate forecast for each period
  for (let i = 0; i < forecastPeriods; i++) {
    // For each forecast period, use the last 'window' actual values or forecasted values
    const startIdx = data.length + i - window;
    const endIdx = data.length + i;
    
    // Collect the values to use for this forecast point
    const valuesToUse = [];
    
    for (let j = startIdx; j < endIdx; j++) {
      if (j < data.length) {
        // Use actual data
        valuesToUse.push(data[j]);
      } else {
        // Use previously forecasted data
        valuesToUse.push(forecast[j - data.length]);
      }
    }
    
    // Calculate the moving average
    const sum = valuesToUse.reduce((acc, val) => acc + val, 0);
    const average = sum / window;
    
    // Add to forecast
    forecast.push(Math.round(average));
  }
  
  return forecast;
}

/**
 * Calculate SMA forecast for feed consumption data
 * @param {Array} monthlyData - Array of monthly feed data objects
 * @param {String} field - The field to forecast (e.g., 'pakan_bulan')
 * @param {Number} window - The window size for moving average
 * @param {Number} periods - Number of periods to forecast
 * @returns {Object} - Original data and forecast values
 */
function forecastFeedConsumption(monthlyData, field, window, periods) {
  // Extract the field values
  const values = monthlyData.map(item => item[field]);
  
  // Calculate forecast
  const forecastValues = smaForecast(values, window, periods);
  
  // Format the forecast results
  const lastMonth = monthlyData.length;
  const forecast = forecastValues.map((value, index) => {
    return {
      month: lastMonth + index + 1,
      [field]: value,
      is_forecast: true
    };
  });
  
  return {
    actual: monthlyData,
    forecast: forecast
  };
}

module.exports = {
  smaForecast,
  forecastFeedConsumption
};