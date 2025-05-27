document.addEventListener('DOMContentLoaded', function () {
    const canvasElement = document.getElementById('telurForecastChart'); // ID bisa diganti jika mau
    const loaderElement = document.getElementById('chartLoader');
    const errorElement = document.getElementById('chartError');

    if (!canvasElement) {
        console.error('Elemen canvas #telurForecastChart tidak ditemukan!');
        if(errorElement) errorElement.style.display = 'block';
        return;
    }

    let combinedChartInstance = null; // Mengganti nama variabel instance chart

    let currentWindow = 4;
    let currentPeriods = 3;

    function showLoading(isLoading) {
        if (loaderElement) loaderElement.style.display = isLoading ? 'block' : 'none';
        if (errorElement) errorElement.style.display = 'none';
        canvasElement.style.opacity = isLoading ? 0.5 : 1;
    }

    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message || 'Gagal memuat data grafik.';
            errorElement.style.display = 'block';
        }
        if (loaderElement) loaderElement.style.display = 'none';
        canvasElement.style.opacity = 0.5;
    }

    const formatChartLabel = (item) => `${item.bulan}/${item.tahun}`;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const formatDisplayLabel = (label) => {
        const [month, year] = label.split('/');
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    async function loadAndRenderChart(windowSize, periodsToForecast) {
        showLoading(true);
        try {
            const adminApiEndpoint = `/admin/forecasts?window=${windowSize}&periods=${periodsToForecast}`;
            const response = await fetch(adminApiEndpoint);

            if (!response.ok) {
                throw new Error(`Gagal mengambil data: Status ${response.status}`);
            }
            const apiData = await response.json();

            console.log("API Data:", JSON.stringify(apiData, null, 2));

            // Ekstrak data Telur
            const telurData = apiData.telur && apiData.telur.data ? apiData.telur.data : { actual: [], forecast: [] };
            const telurActuals = (telurData.actual || []).sort((a,b) => new Date(a.tahun, a.bulan -1) - new Date(b.tahun, b.bulan -1));
            const telurForecasts = (telurData.forecast || []).sort((a,b) => new Date(a.tahun, a.bulan -1) - new Date(b.tahun, b.bulan -1));

            // Ekstrak data Pakan
            const pakanData = apiData.pakan && apiData.pakan.data ? apiData.pakan.data : { actual: [], forecast: [] };
            // Pastikan sorting menggunakan atribut yang benar jika tanggalnya berbeda
            const pakanActuals = (pakanData.actual || []).sort((a,b) => new Date(a.tahun, a.bulan -1) - new Date(b.tahun, b.bulan -1));
            const pakanForecasts = (pakanData.forecast || []).sort((a,b) => new Date(a.tahun, a.bulan -1) - new Date(b.tahun, b.bulan -1));

            if (!apiData.telur && !apiData.pakan) {
                throw new Error('Data prediksi telur dan pakan tidak ditemukan.');
            }

            // Siapkan label untuk sumbu-X (Bulan/Tahun) - gabungkan dari semua data
            const allLabelsSet = new Set([
                ...telurActuals.map(formatChartLabel),
                ...telurForecasts.map(formatChartLabel),
                ...pakanActuals.map(formatChartLabel),
                ...pakanForecasts.map(formatChartLabel)
            ]);
            const sortedLabels = Array.from(allLabelsSet).sort((a, b) => {
                const [monthA, yearA] = a.split('/').map(Number);
                const [monthB, yearB] = b.split('/').map(Number);
                if (yearA !== yearB) return yearA - yearB;
                return monthA - monthB;
            });
            const displayLabels = sortedLabels.map(formatDisplayLabel);

            // --- Proses Data Telur ---
            const telurActualChartData = sortedLabels.map(label => {
                const found = telurActuals.find(item => formatChartLabel(item) === label);
                return found ? found.total_telur_kg : null;
            });
            const telurForecastChartData = new Array(sortedLabels.length).fill(null);
            let lastTelurActualIndex = telurActualChartData.map((val, idx) => val !== null ? idx : -1).filter(idx => idx !== -1).pop() ?? -1;

            if (lastTelurActualIndex !== -1 && telurActuals.length > 0) {
                telurForecastChartData[lastTelurActualIndex] = telurActualChartData[lastTelurActualIndex];
            }
            telurForecasts.forEach(item => {
                const index = sortedLabels.indexOf(formatChartLabel(item));
                if (index !== -1) telurForecastChartData[index] = item.total_telur_kg;
            });

            // --- Proses Data Pakan ---
            const pakanActualChartData = sortedLabels.map(label => {
                const found = pakanActuals.find(item => formatChartLabel(item) === label);
                // GUNAKAN total_Pakan_kg (DENGAN 'P' BESAR) SESUAI API RESPONSE
                return found && typeof found.total_Pakan_kg !== 'undefined' ? found.total_Pakan_kg : null;
            });

            const pakanForecastChartData = new Array(sortedLabels.length).fill(null);
            let lastPakanActualIndex = pakanActualChartData.map((val, idx) => val !== null ? idx : -1).filter(idx => idx !== -1).pop() ?? -1;
            
            if (lastPakanActualIndex !== -1 && pakanActuals.length > 0) {
                 // GUNAKAN total_Pakan_kg (DENGAN 'P' BESAR)
                pakanForecastChartData[lastPakanActualIndex] = pakanActualChartData[lastPakanActualIndex];
            }
            pakanForecasts.forEach(item => {
                const index = sortedLabels.indexOf(formatChartLabel(item));
                // GUNAKAN total_Pakan_kg (DENGAN 'P' BESAR)
                if (index !== -1 && typeof item.total_Pakan_kg !== 'undefined') {
                     pakanForecastChartData[index] = item.total_Pakan_kg;
                }
            });


            if (combinedChartInstance) {
                combinedChartInstance.destroy();
            }




            const ctx = canvasElement.getContext('2d');
            combinedChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: displayLabels,
                    datasets: [
                        // Dataset Telur
                        {
                            label: 'Telur Aktual (Kg)',
                            data: telurActualChartData,
                            borderColor: 'rgba(78, 115, 223, 1)', // Biru
                            backgroundColor: 'rgba(78, 115, 223, 0.1)',
                            tension: 0.1,
                            fill: true,
                            pointRadius: 3,
                            pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                            yAxisID: 'yTelur', // Menambahkan ID untuk sumbu Y Telur
                        },
                        {
                            label: 'Prediksi Telur (Kg)',
                            data: telurForecastChartData,
                            borderColor: 'rgba(231, 76, 60, 1)', // Merah
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            tension: 0.1,
                            fill: true,
                            borderDash: [5, 5],
                            pointRadius: 3,
                            pointStyle: 'rectRot',
                            pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                            yAxisID: 'yTelur', // Menambahkan ID untuk sumbu Y Telur
                        },
                        // Dataset Pakan
                        {
                            label: 'Pakan Aktual (Kg)',
                            data: pakanActualChartData,
                            borderColor: 'rgba(46, 204, 113, 1)', // Hijau
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            tension: 0.1,
                            fill: true,
                            pointRadius: 3,
                            pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                            yAxisID: 'yPakan', // Menambahkan ID untuk sumbu Y Pakan
                        },
                        {
                            label: 'Prediksi Pakan (Kg)',
                            data: pakanForecastChartData,
                            borderColor: 'rgba(243, 156, 18, 1)', // Oranye
                            backgroundColor: 'rgba(243, 156, 18, 0.1)',
                            tension: 0.1,
                            fill: true,
                            borderDash: [5, 5],
                            pointRadius: 3,
                            pointStyle: 'triangle',
                            pointBackgroundColor: 'rgba(243, 156, 18, 1)',
                            yAxisID: 'yPakan', // Menambahkan ID untuk sumbu Y Pakan
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Periode (Bulan/Tahun)'
                            }
                        },
                        yTelur: { // Konfigurasi Sumbu Y untuk Telur
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Total Produksi Telur (Kg)',
                                color: 'rgba(78, 115, 223, 1)'
                            },
                            ticks: {
                                callback: function(value) { return value.toLocaleString('id-ID'); },
                                color: 'rgba(78, 115, 223, 1)'
                            },
                            grid: {
                                drawOnChartArea: true // Hanya grid utama dari sumbu ini
                            }
                        },
                        yPakan: { // Konfigurasi Sumbu Y untuk Pakan
                            type: 'linear',
                            display: true,
                            position: 'right', // Posisikan di kanan
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Total Penggunaan Pakan (Kg)',
                                color: 'rgba(46, 204, 113, 1)'
                            },
                            ticks: {
                                callback: function(value) { return value.toLocaleString('id-ID'); },
                                color: 'rgba(46, 204, 113, 1)'
                            },
                            grid: {
                                drawOnChartArea: false // Hindari grid ganda
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: `Prediksi Moving Average (Window: ${windowSize}, Periode: ${periodsToForecast}) - Telur & Pakan`,
                            font: { size: 16 }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y.toLocaleString('id-ID') + ' Kg';
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            showLoading(false);
        } catch (error) {
            console.error('Gagal memuat atau merender grafik:', error);
            showError(error.message);
            showLoading(false);
        }
    }

    loadAndRenderChart(currentWindow, currentPeriods);

    const refreshButton = document.getElementById('refreshForecastChartButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            const newWindow = parseInt(document.getElementById('forecastWindowInput').value) || 4;
            const newPeriods = parseInt(document.getElementById('forecastPeriodsInput').value) || 4;
            currentWindow = newWindow;
            currentPeriods = newPeriods;
            loadAndRenderChart(currentWindow, currentPeriods);
        });
    }
});