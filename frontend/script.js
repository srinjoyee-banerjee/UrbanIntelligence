// ============================================================
// URBAN//INTELLIGENCE
// NEON FRONTEND DATA ENGINE
// ============================================================


const DATA_PATH = "/data/";


const DATA_FILES = {

    pressure:
        DATA_PATH + "urban_pressure_by_station.csv",

    powerbi:
        DATA_PATH + "powerbi_urban_pressure.csv",

    daily:
        DATA_PATH + "daily_pollution_pressure.csv"

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

        throw new Error(
            "Unable to load " + url
        );

    }


    const text =
        await response.text();



    return Papa.parse(
        text,
        {
            header:true,
            skipEmptyLines:true,
            dynamicTyping:true
        }
    ).data;

}




// ============================================================
// HELPERS
// ============================================================


function num(value){

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : null;

}



function fmt(value,digits=2){

    const n=num(value);

    return n===null
        ? "—"
        : n.toFixed(digits);

}



function setText(id,value){

    const el =
        document.getElementById(id);


    if(el){

        el.textContent=value;

    }

}




function findColumn(row,names){

    if(!row)
        return null;


    const keys =
        Object.keys(row);



    for(const name of names){

        const found =
            keys.find(
                k =>
                k.toLowerCase().trim()
                ===
                name.toLowerCase()
            );


        if(found)
            return found;

    }



    for(const name of names){

        const found =
            keys.find(
                k =>
                k.toLowerCase()
                .includes(
                    name.toLowerCase()
                )
            );


        if(found)
            return found;

    }


    return null;

}





// ============================================================
// LOAD DATA
// ============================================================


async function loadAllData(){

    try{


        [
            pressureData,
            powerbiData,
            dailyData

        ] =
        await Promise.all([

            loadCSV(DATA_FILES.pressure),

            loadCSV(DATA_FILES.powerbi),

            loadCSV(DATA_FILES.daily)

        ]);



        console.log(
            "URBAN//INTELLIGENCE DATA READY"
        );

        console.log(
            "Stations:",
            pressureData.length
        );



        populatePage();



    }

    catch(error){

        console.error(error);


        showError(
            "Unable to load data"
        );

    }

}





// ============================================================
// PAGE ROUTER
// ============================================================


function populatePage(){


    const page =
        window.location.pathname
        .toLowerCase();



    if(page.includes("dashboard")){

        buildDashboard();

    }


    else if(page.includes("result")){

        buildResults();

    }


    else{

        buildHome();

    }


}






// ============================================================
// HOME
// ============================================================


function buildHome(){


    const stationColumn =
        findColumn(
            pressureData[0],
            [
                "station_name",
                "station"
            ]
        );



    const count =
        new Set(
            pressureData.map(
                r=>r[stationColumn]
            )
        ).size;



    setText(
        "station-count",
        count || 30
    );


}





// ============================================================
// DASHBOARD
// ============================================================


function buildDashboard(){


    if(!pressureData.length)
        return;



    const row =
        pressureData[0];



    const pm25 =
        findColumn(
            row,
            [
                "pm25",
                "avg_pm25"
            ]
        );


    const pm10 =
        findColumn(
            row,
            [
                "pm10",
                "avg_pm10"
            ]
        );


    const no2 =
        findColumn(
            row,
            [
                "no2",
                "avg_no2"
            ]
        );



    animateNumber(
        "avgPM25",
        average(pm25)
    );


    animateNumber(
        "avgPM10",
        average(pm10)
    );


    animateNumber(
        "avgNO2",
        average(no2)
    );



    createPressureChart(
        pressureData.slice(0,10)
    );


}





function average(column){

    if(!column)
        return 0;



    const values =
        pressureData
        .map(
            r=>num(r[column])
        )
        .filter(
            x=>x!==null
        );



    if(!values.length)
        return 0;



    return values.reduce(
        (a,b)=>a+b,
        0
    )
    /
    values.length;

}





// ============================================================
// CHART
// ============================================================


function createPressureChart(rows){


    const canvas =
        document.getElementById(
            "pressureChart"
        );



    if(!canvas || typeof Chart==="undefined")
        return;



    const labels =
        rows.map(
            r =>
            r.station_name ||
            r["Station Name"] ||
            "Station"
        );



    const values =
        rows.map(
            r =>
            num(
                r.pressure_score
            ) || 0
        );



    if(window.pressureChartInstance){

        window.pressureChartInstance.destroy();

    }




    window.pressureChartInstance =
    new Chart(

        canvas,

        {

        type:"bar",


        data:{

            labels,


            datasets:[{

                label:
                "Pressure Score",


                data:values,


                backgroundColor:
                "#f5ff00",


                borderColor:
                "#ffffff",


                borderWidth:1,


                borderRadius:8


            }]

        },



        options:{


            responsive:true,


            animation:{

                duration:1500

            },



            plugins:{


                legend:{

                    display:false

                }

            },



            scales:{


                x:{

                    ticks:{

                        color:"#999"

                    }

                },


                y:{

                    ticks:{

                        color:"#999"

                    }

                }


            }


        }


    });


}






// ============================================================
// RESULTS
// ============================================================


function buildResults(){


    if(!pressureData.length)
        return;



    const table =
        document.getElementById(
            "pressureBody"
        );



    if(!table)
        return;



    let html="";



    pressureData
    .slice(0,20)
    .forEach(
        (row,index)=>{


        html += `

        <tr>

        <td>${index+1}</td>

        <td>
        ${row.station_name || "Unknown"}
        </td>

        <td>
        ${fmt(row.pm25)}
        </td>


        <td>
        ${fmt(row.pm10)}
        </td>


        <td>
        ${fmt(row.no2)}
        </td>


        <td>
        ${fmt(row.pressure_score)}
        </td>


        <td class="class-high">
        ${row.pressure_class || "HIGH"}
        </td>


        </tr>

        `;


    });



    table.innerHTML=html;


}






// ============================================================
// NUMBER ANIMATION
// ============================================================


function animateNumber(id,value){


    const el =
        document.getElementById(id);


    if(!el)
        return;



    let start=0;


    const step =
        value / 60;



    const timer =
        setInterval(()=>{


            start += step;



            if(start>=value){

                start=value;

                clearInterval(timer);

            }



            el.textContent =
            start.toFixed(2);



        },20);



}






// ============================================================
// ERROR
// ============================================================


function showError(message){


    console.error(
        message
    );


}






// ============================================================
// START
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    loadAllData
);
