// ============================================================
// URBAN//INTELLIGENCE
// FINAL FRONTEND SCRIPT
// ============================================================


const DATA_URL = "/data/urban_pressure_by_station.csv";


let pressureData = [];



// ============================================================
// LOAD CSV
// ============================================================

async function loadCSV(){

    try{

        const response = await fetch(DATA_URL);


        const text = await response.text();


        pressureData = Papa.parse(
            text,
            {
                header:true,
                skipEmptyLines:true,
                dynamicTyping:true
            }
        ).data;



        console.log(
            "CSV Loaded:",
            pressureData.length
        );


        startApp();


    }

    catch(error){

        console.error(
            "CSV ERROR",
            error
        );

    }

}




// ============================================================
// ROUTER
// ============================================================

function startApp(){


    const path =
        window.location.pathname.toLowerCase();



    if(path.includes("result")){

        buildResults();

    }



    if(path.includes("dashboard")){

        buildDashboard();

    }


}




// ============================================================
// RESULTS PAGE
// ============================================================

function buildResults(){


    const tbody =
        document.getElementById(
            "pressureBody"
        );


    if(!tbody){

        console.log(
            "Table body missing"
        );

        return;

    }



    const sorted =
        pressureData.sort(
            (a,b)=>
            Number(b.pressure_score)
            -
            Number(a.pressure_score)
        );



    let html = "";



    sorted.slice(0,30)
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
                ${Number(row.avg_pm25).toFixed(2)}
            </td>


            <td>
                ${Number(row.avg_pm10).toFixed(2)}
            </td>


            <td>
                ${Number(row.avg_no2).toFixed(2)}
            </td>


            <td>
                ${Number(row.pressure_score).toFixed(2)}
            </td>


            <td>
                ${row.pressure_class}
            </td>


        </tr>

        `;


        }

    );



    tbody.innerHTML = html;



    console.log(
        "Ranking table created"
    );

}






// ============================================================
// DASHBOARD
// ============================================================

function buildDashboard(){


    const pm25 =
        average("avg_pm25");


    const pm10 =
        average("avg_pm10");


    const no2 =
        average("avg_no2");



    setText(
        "avgPM25",
        pm25.toFixed(2)
    );


    setText(
        "avgPM10",
        pm10.toFixed(2)
    );


    setText(
        "avgNO2",
        no2.toFixed(2)
    );


}






// ============================================================
// HELPERS
// ============================================================


function average(column){


    let values =
        pressureData
        .map(
            r=>Number(r[column])
        )
        .filter(
            x=>!isNaN(x)
        );


    return values.reduce(
        (a,b)=>a+b,
        0
    ) / values.length;


}



function setText(id,value){

    const el =
        document.getElementById(id);


    if(el){

        el.textContent=value;

    }

}




// ============================================================
// START
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    loadCSV
);
