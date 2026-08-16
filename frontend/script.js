// ============================================================
// URBAN//INTELLIGENCE
// FRONTEND DATA ENGINE
// ============================================================


const DATA_PATH = "/data/";


const FILES = {

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
            "CSV loading failed: " + url
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


function fmt(value){

    let n = Number(value);


    if(isNaN(n))
        return "—";


    return n.toFixed(2);

}




function setText(id,value){

    const el =
        document.getElementById(id);


    if(el){

        el.textContent = value;

    }

}




// ============================================================
// LOAD ALL DATA
// ============================================================


async function loadData(){

    try{


        pressureData =
            await loadCSV(
                FILES.pressure
            );


        powerbiData =
            await loadCSV(
                FILES.powerbi
            );


        dailyData =
            await loadCSV(
                FILES.daily
            );



        console.log(
            "DATA LOADED",
            pressureData.length
        );



        routePage();


    }


    catch(error){

        console.error(error);

    }

}





// ============================================================
// PAGE ROUTER
// ============================================================


function routePage(){


    const page =
        window.location.pathname
        .toLowerCase();



    if(page.includes("dashboard")){

        dashboardPage();

    }



    else if(page.includes("result")){

        resultsPage();

    }



}





// ============================================================
// DASHBOARD
// ============================================================


function dashboardPage(){


    if(!pressureData.length)
        return;



    animateNumber(
        "avgPM25",
        average("avg_pm25")
    );


    animateNumber(
        "avgPM10",
        average("avg_pm10")
    );


    animateNumber(
        "avgNO2",
        average("avg_no2")
    );



    createSeasonChart();

    createHourChart();


}





function average(column){


    const values =
        pressureData
        .map(
            r => Number(r[column])
        )
        .filter(
            x => !isNaN(x)
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

                label:"PM2.5 Pressure",


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


        options:chartTheme()


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



                backgroundColor:"#f5ff00",


                borderRadius:8


            }]


        },


        options:chartTheme()


        }

    );


}





function chartTheme(){

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

                    color:"#aaa"

                }

            },


            y:{

                ticks:{

                    color:"#aaa"

                }

            }


        }

    };

}





// ============================================================
// RESULTS TABLE
// ============================================================


function resultsPage(){


    const body =
        document.getElementById(
            "pressureBody"
        );


    if(!body)
        return;



    let html = "";



    pressureData

    .sort(

        (a,b)=>

        Number(b.pressure_score)

        -

        Number(a.pressure_score)

    )

    .slice(0,30)


    .forEach(

        (row,index)=>{


        html += `


        <tr>


        <td>
        ${index+1}
        </td>


        <td>
        ${row["Station Name"]}
        </td>


        <td>
        ${fmt(row.avg_pm25)}
        </td>


        <td>
        ${fmt(row.avg_pm10)}
        </td>


        <td>
        ${fmt(row.avg_no2)}
        </td>


        <td>
        ${fmt(row.pressure_score)}
        </td>


        <td class="class-high">

        ${row.pressure_class}

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


function animateNumber(id,target){


    const el =
        document.getElementById(id);


    if(!el)
        return;



    let value=0;


    const step =
        target/60;



    const timer =
        setInterval(()=>{


            value += step;



            if(value>=target){

                value=target;

                clearInterval(timer);

            }



            el.textContent =
            value.toFixed(2);



        },20);


}





// ============================================================
// START
// ============================================================


document.addEventListener(

    "DOMContentLoaded",

    loadData

);
