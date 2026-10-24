// ===============================
// Load All Dropdowns
// ===============================

async function loadDropdowns() {

    const response = await fetch("/dropdowns");
    const data = await response.json();

    fillSelect("category", data.categories);
    fillSelect("branch", data.branches);
    fillSelect("region", data.regions);
    fillSelect("college_type", data.college_types);

    loadDistricts();

}

// ===============================
// Fill Select
// ===============================

function fillSelect(id, list) {

    let select = document.getElementById(id);

    select.innerHTML = "";

    select.innerHTML +=
    `<option value="ALL">ALL</option>`;

    list.forEach(item => {

        select.innerHTML +=
        `<option value="${item}">
            ${item}
        </option>`;

    });

}

// ===============================
// Load Districts
// ===============================

async function loadDistricts() {

    let region =
    document.getElementById("region").value;

    let response =
    await fetch("/districts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            region: region
        })

    });

    let districts =
    await response.json();

    let district =
    document.getElementById("district");

    district.innerHTML =
    `<option value="ALL">ALL</option>`;

    districts.forEach(d => {

        district.innerHTML +=
        `<option value="${d}">
            ${d}
        </option>`;

    });

}

// ===============================
// Search College
// ===============================

async function searchCollege() {

    let percentage =
    document.getElementById("percentage").value;

    let category =
    document.getElementById("category").value;

    let branch =
    document.getElementById("branch").value;

    let region =
    document.getElementById("region").value;

    let district =
    document.getElementById("district").value;

    let college_type =
    document.getElementById("college_type").value;

    document.getElementById("loading").style.display =
    "block";

    document.getElementById("result").innerHTML = "";

    let response =
    await fetch("/predict", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            percentage: percentage,

            category: category,

            branch: branch,

            region: region,

            district: district,

            college_type: college_type

        })

    });

    let data =
    await response.json();

    document.getElementById("loading").style.display =
    "none";

    showResult(data);

}

// ===============================
// Search College
// ===============================

async function searchCollege() {

    let percentage =
        document.getElementById(
            "percentage"
        ).value;

    let category =
        document.getElementById(
            "category"
        ).value;

    let branch =
        document.getElementById(
            "branch"
        ).value;

    let region =
        document.getElementById(
            "region"
        ).value;

    let district =
        document.getElementById(
            "district"
        ).value;

    let college_type =
        document.getElementById(
            "college_type"
        ).value;


    if (
        percentage === ""
        ||
        isNaN(
            parseFloat(
                percentage
            )
        )
        ||
        parseFloat(
            percentage
        ) < 0
        ||
        parseFloat(
            percentage
        ) > 100
    ) {

        alert(
            "Please enter valid Diploma Percentage (0 - 100)."
        );

        return;

    }


    const loading =
        document.getElementById(
            "loading"
        );


    const result =
        document.getElementById(
            "result"
        );


    loading.style.display =
        "block";


    result.innerHTML =
        "";


    try {

        const response =
            await fetch(

                "/predict",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            percentage:
                                percentage,

                            category:
                                category,

                            branch:
                                branch,

                            region:
                                region,

                            district:
                                district,

                            college_type:
                                college_type

                        })

                }

            );


        // ===============================
        // LOGIN / PAYMENT CHECK
        // ===============================

        if (
            await handleLockedResponse(
                response
            )
        ) {

            loading.style.display =
                "none";

            return;

        }


        // ===============================
        // GET DATA
        // ===============================

        const data =
            await response.json();


        loading.style.display =
            "none";


        // ===============================
        // API ERROR
        // ===============================

        if (!response.ok) {

            alert(

                data.error

                ||

                "Unable to predict colleges."

            );

            return;

        }


        // ===============================
        // SHOW RESULT
        // ===============================

        showResult(
            data
        );

    }

    catch (error) {

        loading.style.display =
            "none";


        console.error(
            "DSE PREDICT ERROR:",
            error
        );


        alert(
            "Server error. Please try again."
        );

    }

}
// ===============================
// Show Result
// ===============================

// ===============================
// Show Result
// ===============================

function showResult(data) {

    let result =
        document.getElementById("result");

    result.innerHTML = "";


    // ===============================
    // NO RESULT
    // ===============================

    if (data.length === 0) {

        result.innerHTML = `

        <div class="no-result">

            <h2>No College Found 😔</h2>

            <p>
                Try changing Percentage,
                Category or Branch.
            </p>

        </div>

        `;

        return;

    }


    // ===============================
    // GROUP BY COLLEGE CODE
    // ===============================

    const collegeGroups = {};


    data.forEach(c => {

        const collegeCode =
            String(c.college_code);


        if (!collegeGroups[collegeCode]) {

            collegeGroups[collegeCode] = {

                college_code:
                    c.college_code,

                college_name:
                    c.college_name,

                district:
                    c.district,

                region:
                    c.region,

                college_type:
                    c.college_type,

                records: []

            };

        }


        collegeGroups[
            collegeCode
        ].records.push(c);

    });


    // ===============================
    // UNIQUE COLLEGE COUNT
    // ===============================

    const colleges =
        Object.values(collegeGroups);


    result.innerHTML += `

        <h2 style="
            margin-bottom:20px;
            color:#2563eb;
            text-align:center;
        ">

            Eligible Colleges :
            ${colleges.length}

        </h2>

    `;


    // ===============================
    // COLLEGE CARDS
    // ===============================

    colleges.forEach(college => {


        const instituteCode =
            String(
                college.college_code
            ).padStart(5, "0");


        const dteUrl =

            `https://dse2025.mahacet.org.in/dse25/index.php/hp_controller/institute_information/${instituteCode}`;


        // ===============================
        // RECORD HTML
        // ===============================

        let recordsHtml = "";


        college.records.forEach(c => {


            let color = "#16a34a";


            if (c.cutoff >= 90) {

                color = "#dc2626";

            }

            else if (c.cutoff >= 80) {

                color = "#ea580c";

            }

            else if (c.cutoff >= 70) {

                color = "#2563eb";

            }


            recordsHtml += `

                <div class="college-branch-record">

                    <p>

                        <b>Branch :</b>

                        ${escapeResultHtml(
                            c.branch
                        )}

                    </p>


                    <p>

                        <b>Category :</b>

                        ${escapeResultHtml(
                            c.category
                        )}

                    </p>


                    <p>

                        <b>Cutoff :</b>

                        <span style="
                            color:${color};
                            font-weight:bold;
                        ">

                            ${c.cutoff} %

                        </span>

                    </p>


                    <p>

                        <b>Choice Code :</b>

                        ${escapeResultHtml(
                            c.choice_code
                        )}

                    </p>

                </div>

            `;

        });


        // ===============================
        // COLLEGE CARD
        // ===============================

        result.innerHTML += `

            <div class="result-card grouped-college-card">


                <div class="grouped-college-header">

                    <h2>

                        ${escapeResultHtml(
                            college.college_name
                        )}

                    </h2>


                    <span class="college-code-small">

                        Code:
                        ${escapeResultHtml(
                            college.college_code
                        )}

                    </span>

                </div>


                <div class="grouped-college-location">

                    <p>

                        <b>District :</b>

                        ${escapeResultHtml(
                            college.district
                        )}

                    </p>


                    <p>

                        <b>Region :</b>

                        ${escapeResultHtml(
                            college.region
                        )}

                    </p>


                    <p>

                        <b>College Type :</b>

                        ${escapeResultHtml(
                            college.college_type
                        )}

                    </p>

                </div>


                <div class="college-record-list">

                    ${recordsHtml}

                </div>


                <a
                    href="${dteUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="visit-btn"
                >

                    🌐 Visit DTE Portal

                </a>


            </div>

        `;

    });

}


// ===============================
// ESCAPE RESULT HTML
// ===============================

function escapeResultHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
// ===============================
// Enter Key Support
// ===============================

document.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        searchCollege();

    }

});

// ===============================
// Page Load
// ===============================

window.onload = function () {

    loadDropdowns();

};