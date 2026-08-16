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


async function loadCSV(url){

    const response = await fetch(url);


    if(!response.ok){

        throw new Error(
            "Cannot load " + url
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

        const col =
            keys.find(
                k =>
                k.toLowerCase().trim()
                ===
                name.toLowerCase()
            );


        if(col)
            return col;

    }



    for(const name of names){

        const col =
            keys.find(
                k =>
                k.toLowerCase()
                .includes(
                    name.toLowerCase()
                )
            );


        if(col)
            return col;

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
            "URBAN//INTELLIGENCE READY"
        );


        populatePage();



    }

    catch(error){

        console.error(error);

    }

}





// ============================================================
// ROUTER
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



    const stations =
        new Set(
            pressureData.map(
                r=>r[stationColumn]
            )
        ).size;



    setText(
        "station-count",
        stations || 30
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



    createSeasonChart();

    createHourChart();


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
// SEASON CHART
// ============================================================


function createSeasonChart(){


    const canvas =
        document.getElementById(
            "seasonChart"
        );


    if(!canvas)
        return;



    new Chart(

        canvas,

        {


        type:"line",


        data:{


            labels:[

                "Winter",
                "Summer",
                "Monsoon",
                "Post Monsoon"

            ],


            datasets:[{

                label:"Pollution Pressure",


                data:[

                    62,
                    38,
                    24,
                    45

                ],


                borderColor:"#f5ff00",

                backgroundColor:
                "rgba(245,255,0,0.15)",


                fill:true,

                tension:0.4


            }]


        },


        options:chartOptions()


        }


    );


}





// ============================================================
// HOURLY CHART
// ============================================================


function createHourChart(){


    const canvas =
        document.getElementById(
            "hourChart"
        );


    if(!canvas)
        return;



    new Chart(

        canvas,

        {


        type:"bar",


        data:{


            labels:[

                "00",
                "03",
                "06",
                "09",
                "12",
                "15",
                "18",
                "21"

            ],


            datasets:[{

                label:"PM2.5",


                data:[

                    28,
                    31,
                    40,
                    58,
                    45,
                    39,
                    50,
                    54

                ],


                backgroundColor:
                "#f5ff00",


                borderRadius:8


            }]


        },


        options:chartOptions()


        }


    );


}






// ============================================================
// CHART STYLE
// ============================================================


function chartOptions(){


    return {


        responsive:true,


        animation:{

            duration:1500

        },


        plugins:{


            legend:{


                labels:{


                    color:"#f5ff00"


                }


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


    };


}






// ============================================================
// RESULTS
// ============================================================


function buildResults(){


    const body =
        document.getElementById(
            "pressureBody"
        );



    if(!body)
        return;



    let html="";



    pressureData
    .slice(0,30)
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


        }

    );



    body.innerHTML = html;


}





// ============================================================
// NUMBER ANIMATION
// ============================================================


function animateNumber(id,value){


    const el =
        document.getElementById(id);



    if(!el)
        return;



    let current=0;


    const step =
        value/60;



    const timer =
        setInterval(()=>{


            current += step;



            if(current>=value){

                current=value;

                clearInterval(timer);

            }



            el.textContent =
            current.toFixed(2);



        },20);



}






// ============================================================
// START
// ============================================================


document.addEventListener(

    "DOMContentLoaded",

    loadAllData

);
