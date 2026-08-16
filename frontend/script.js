
// ============================================================
// URBAN//INTELLIGENCE
// FRONTEND DATA ENGINE
// ============================================================

const DATA_PATH = "../data/";

const DATA_FILES = {
    pressure: DATA_PATH + "urban_pressure_by_station.csv",
    powerbi: DATA_PATH + "powerbi_urban_pressure.csv",
    daily: DATA_PATH + "daily_pollution_pressure.csv"
};

let pressureData = [];
let powerbiData = [];
let dailyData = [];


// ============================================================
// CSV LOADER
// ============================================================

async function loadCSV(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Unable to load ${url}`);
    }

    const text = await response.text();

    return Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    }).data;
}


// ============================================================
// NUMBER HELPERS
// ============================================================

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function fmt(value, digits = 2) {
    const n = num(value);
    if (n === null) return "—";
    return n.toFixed(digits);
}

function formatNumber(value) {
    const n = num(value);
    if (n === null) return "—";
    return n.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


// ============================================================
// FIND COLUMN
// ============================================================

function findColumn(row, names) {
    if (!row) return null;

    const keys = Object.keys(row);

    for (const name of names) {
        const exact = keys.find(
            k => k.toLowerCase().trim() === name.toLowerCase()
        );

        if (exact) return exact;
    }

    for (const name of names) {
        const partial = keys.find(
            k => k.toLowerCase().includes(name.toLowerCase())
        );

        if (partial) return partial;
    }

    return null;
}


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadAllData() {

    try {

        [pressureData, powerbiData, dailyData] =
            await Promise.all([
                loadCSV(DATA_FILES.pressure),
                loadCSV(DATA_FILES.powerbi),
                loadCSV(DATA_FILES.daily)
            ]);

        console.log("========================================");
        console.log("URBAN//INTELLIGENCE DATA LOADED");
        console.log("Pressure:", pressureData.length);
        console.log("Power BI:", powerbiData.length);
        console.log("Daily:", dailyData.length);
        console.log("========================================");

        populatePage();

    } catch (error) {

        console.error("DATA LOAD ERROR:", error);

        showError(
            "Unable to load the dashboard data. " +
            "Please run the website through a web server."
        );
    }
}


// ============================================================
// PAGE DETECTION
// ============================================================

function populatePage() {

    const page = window.location.pathname.toLowerCase();

    if (page.includes("dashboard")) {
        buildDashboard();
    }

    else if (page.includes("result")) {
        buildResults();
    }

    else {
        buildHome();
    }
}


// ============================================================
// HOME PAGE
// ============================================================

function buildHome() {

    const stationCount =
        new Set(
            pressureData.map(row =>
                row.station_name ||
                row["Station Name"] ||
                row["station name"]
            )
        ).size;

    setText("station-count", stationCount || 30);
    setText("data-years", "2024–2025");
    setText("dataset-rows", "2.1M+");

}


// ============================================================
// DASHBOARD
// ============================================================

function buildDashboard() {

    if (!pressureData.length) return;

    const stationColumn =
        findColumn(pressureData[0], [
            "station_name",
            "Station Name"
        ]);

    const scoreColumn =
        findColumn(pressureData[0], [
            "pressure_score",
            "pressure score"
        ]);

    const classColumn =
        findColumn(pressureData[0], [
            "pressure_class",
            "pollution_category"
        ]);

    const pm25Column =
        findColumn(pressureData[0], [
            "avg_pm25",
            "pm25"
        ]);

    const pm10Column =
        findColumn(pressureData[0], [
            "avg_pm10",
            "pm10"
        ]);

    const no2Column =
        findColumn(pressureData[0], [
            "avg_no2",
            "no2"
        ]);


    // --------------------------------------------------------
    // TOP STATION
    // --------------------------------------------------------

    const ranked = [...pressureData]
        .filter(row => num(row[scoreColumn]) !== null)
        .sort(
            (a, b) =>
                num(b[scoreColumn]) -
                num(a[scoreColumn])
        );

    const top = ranked[0];

    if (top) {

        setText(
            "top-station",
            top[stationColumn] || "—"
        );

        setText(
            "top-pressure",
            fmt(top[scoreColumn])
        );

        setText(
            "top-class",
            top[classColumn] || "UNKNOWN"
        );

        setText(
            "top-pm25",
            fmt(top[pm25Column])
        );

        setText(
            "top-pm10",
            fmt(top[pm10Column])
        );

        setText(
            "top-no2",
            fmt(top[no2Column])
        );
    }


    // --------------------------------------------------------
    // STATION COUNT
    // --------------------------------------------------------

    const stations = new Set(
        pressureData.map(
            row => row[stationColumn]
        )
    );

    setText(
        "station-count",
        stations.size
    );


    // --------------------------------------------------------
    // PRESSURE DISTRIBUTION
    // --------------------------------------------------------

    const distribution = {};

    pressureData.forEach(row => {

        const cls =
            row[classColumn] || "UNKNOWN";

        distribution[cls] =
            (distribution[cls] || 0) + 1;
    });


    const moderate =
        distribution["MODERATE"] || 0;

    const high =
        distribution["HIGH"] || 0;

    const low =
        distribution["LOW"] || 0;

    const unknown =
        distribution["UNKNOWN"] || 0;


    setText("moderate-count", moderate);
    setText("high-count", high);
    setText("low-count", low);
    setText("unknown-count", unknown);


    // --------------------------------------------------------
    // TOP STATIONS TABLE
    // --------------------------------------------------------

    createStationTable(
        ranked.slice(0, 10)
    );


    // --------------------------------------------------------
    // CHART
    // --------------------------------------------------------

    createPressureChart(ranked.slice(0, 10));

}


// ============================================================
// STATION TABLE
// ============================================================

function createStationTable(rows) {

    const table =
        document.getElementById("station-table");

    if (!table) return;

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Station</th>
                    <th>Pressure</th>
                    <th>Class</th>
                </tr>
            </thead>
            <tbody>
    `;

    rows.forEach((row, index) => {

        const station =
            row.station_name ||
            row["Station Name"] ||
            "Unknown";

        const score =
            row.pressure_score;

        const cls =
            row.pressure_class ||
            "UNKNOWN";

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${station}</td>
                <td>${fmt(score)}</td>
                <td>
                    <span class="pressure-${String(cls).toLowerCase()}">
                        ${cls}
                    </span>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    table.innerHTML = html;
}


// ============================================================
// PRESSURE CHART
// ============================================================

function createPressureChart(rows) {

    const canvas =
        document.getElementById("pressureChart");

    if (!canvas || typeof Chart === "undefined")
        return;

    const labels =
        rows.map(
            row =>
                row.station_name ||
                row["Station Name"] ||
                "Unknown"
        );

    const values =
        rows.map(
            row =>
                num(row.pressure_score) || 0
        );

    if (window.pressureChartInstance) {
        window.pressureChartInstance.destroy();
    }

    window.pressureChartInstance =
        new Chart(canvas, {

            type: "bar",

            data: {
                labels,
                datasets: [{
                    label: "Pressure Score",
                    data: values
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
}


// ============================================================
// RESULTS PAGE
// ============================================================

function buildResults() {

    if (!pressureData.length)
        return;

    const stationColumn =
        findColumn(
            pressureData[0],
            ["station_name", "Station Name"]
        );

    const scoreColumn =
        findColumn(
            pressureData[0],
            ["pressure_score"]
        );

    const classColumn =
        findColumn(
            pressureData[0],
            ["pressure_class"]
        );

    const ranked =
        [...pressureData]
            .filter(
                row =>
                    num(row[scoreColumn]) !== null
            )
            .sort(
                (a, b) =>
                    num(b[scoreColumn]) -
                    num(a[scoreColumn])
            );

    const top = ranked[0];

    if (top) {

        setText(
            "result-station",
            top[stationColumn]
        );

        setText(
            "result-score",
            fmt(top[scoreColumn])
        );

        setText(
            "result-class",
            top[classColumn] || "UNKNOWN"
        );
    }

    createStationTable(ranked);

}


// ============================================================
// DAILY DATA SUMMARY
// ============================================================

function dailySummary() {

    if (!dailyData.length)
        return null;

    const pm25 =
        findColumn(
            dailyData[0],
            ["pm25"]
        );

    const pm10 =
        findColumn(
            dailyData[0],
            ["pm10"]
        );

    const no2 =
        findColumn(
            dailyData[0],
            ["no2"]
        );

    function average(column) {

        const values =
            dailyData
                .map(row => num(row[column]))
                .filter(v => v !== null);

        if (!values.length)
            return null;

        return values.reduce(
            (a, b) => a + b,
            0
        ) / values.length;
    }

    return {
        pm25: average(pm25),
        pm10: average(pm10),
        no2: average(no2)
    };
}


// ============================================================
// TEXT HELPER
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element)
        element.textContent = value;
}


// ============================================================
// ERROR
// ============================================================

function showError(message) {

    const error =
        document.getElementById("data-error");

    if (error) {
        error.textContent = message;
        error.style.display = "block";
    }
}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadAllData
);
