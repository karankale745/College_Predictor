// ======================================
// MHT CET COLLEGE PREDICTOR
// ======================================


// ======================================
// LOAD ALL DROPDOWNS
// ======================================

async function loadDropdowns() {

    try {

        const response =
            await fetch("/mhtcet_dropdowns");

        const data =
            await response.json();


        fillSelect(
            "category",
            data.categories,
            true
        );

        fillSelect(
            "branch",
            data.branches
        );

        fillSelect(
            "region",
            data.regions
        );

        fillSelect(
            "college_type",
            data.college_types
        );


        await loadDistricts();

    }

    catch (error) {

        console.error(
            "Dropdown Load Error:",
            error
        );

    }

}


// ======================================
// FILL SELECT
// ======================================

function fillSelect(
    id,
    list,
    isCategory = false
) {

    const select =
        document.getElementById(id);


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="ALL">

            ALL

        </option>

    `;


    list.forEach(item => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            item;


        option.textContent =

            isCategory

            ?

            formatCategory(item)

            :

            item;


        select.appendChild(
            option
        );

    });

}


// ======================================
// LOAD DISTRICTS
// ======================================

async function loadDistricts() {

    const regionElement =
        document.getElementById(
            "region"
        );


    const districtElement =
        document.getElementById(
            "district"
        );


    if (
        !regionElement

        ||

        !districtElement
    ) {

        return;

    }


    const region =
        regionElement.value;


    try {

        const response =
            await fetch(

                "/mhtcet_districts",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            region:
                                region

                        })

                }

            );


        const districts =
            await response.json();


        districtElement.innerHTML = `

            <option value="ALL">

                ALL

            </option>

        `;


        districts.forEach(district => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                district;


            option.textContent =
                district;


            districtElement.appendChild(
                option
            );

        });

    }

    catch (error) {

        console.error(
            "District Load Error:",
            error
        );

    }

}


// ======================================
// SEARCH COLLEGE
// ======================================

async function searchCollege() {

    const percentileElement =
        document.getElementById(
            "percentile"
        );


    const percentile =
        parseFloat(
            percentileElement.value
        );


    if (
        isNaN(percentile)

        ||

        percentile < 0

        ||

        percentile > 100
    ) {

        alert(

            "Please enter valid MHT CET Percentile (0 - 100)."

        );


        return;

    }


    const category =
        document.getElementById(
            "category"
        ).value;


    const branch =
        document.getElementById(
            "branch"
        ).value;


    const region =
        document.getElementById(
            "region"
        ).value;


    const district =
        document.getElementById(
            "district"
        ).value;


    const collegeType =
        document.getElementById(
            "college_type"
        ).value;


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

                "/mhtcet_predict",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            percentile:
                                percentile,


                            categories:

                                category === "ALL"

                                ?

                                []

                                :

                                [category],


                            branches:

                                branch === "ALL"

                                ?

                                []

                                :

                                [branch],


                            regions:

                                region === "ALL"

                                ?

                                []

                                :

                                [region],


                            districts:

                                district === "ALL"

                                ?

                                []

                                :

                                [district],


                            college_types:

                                collegeType === "ALL"

                                ?

                                []

                                :

                                [collegeType]

                        })

                }

            );


        if (!response.ok) {

            throw new Error(

                "Predict API Error"

            );

        }


        const data =
            await response.json();


        loading.style.display =
            "none";


        showResult(
            data
        );

    }

    catch (error) {

        loading.style.display =
            "none";


        console.error(

            "MHT CET Search Error:",

            error

        );


        result.innerHTML = `

            <div class="no-result">

                <h2>

                    Search Error

                </h2>

                <p>

                    Unable to search colleges.

                </p>

            </div>

        `;

    }

}

// ======================================
// SEARCH COLLEGE
// ======================================

async function searchCollege() {

    const percentile =
        parseFloat(
            document.getElementById(
                "percentile"
            ).value
        );


    if (
        isNaN(percentile)
        ||
        percentile < 0
        ||
        percentile > 100
    ) {

        alert(
            "Please enter valid MHT CET Percentile (0 - 100)."
        );

        return;

    }


    const category =
        document.getElementById(
            "category"
        ).value;


    const branch =
        document.getElementById(
            "branch"
        ).value;


    const region =
        document.getElementById(
            "region"
        ).value;


    const district =
        document.getElementById(
            "district"
        ).value;


    const collegeType =
        document.getElementById(
            "college_type"
        ).value;


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

                "/mhtcet_predict",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            percentile:
                                percentile,

                            categories:

                                category === "ALL"

                                ? []

                                : [category],

                            branches:

                                branch === "ALL"

                                ? []

                                : [branch],

                            regions:

                                region === "ALL"

                                ? []

                                : [region],

                            districts:

                                district === "ALL"

                                ? []

                                : [district],

                            college_types:

                                collegeType === "ALL"

                                ? []

                                : [collegeType]

                        })

                }

            );


        // ==================================
        // LOGIN / PAYMENT ACCESS CHECK
        // ==================================

        if (
            await handleLockedResponse(
                response
            )
        ) {

            loading.style.display =
                "none";

            return;

        }


        // ==================================
        // GET RESPONSE DATA
        // ==================================

        const data =
            await response.json();


        loading.style.display =
            "none";


        // ==================================
        // API ERROR
        // ==================================

        if (!response.ok) {

            alert(

                data.error

                ||

                "Unable to predict colleges."

            );

            return;

        }


        // ==================================
        // SHOW RESULT
        // ==================================

        showResult(
            data
        );

    }

    catch (error) {

        loading.style.display =
            "none";


        console.error(

            "MHT CET Search Error:",

            error

        );


        result.innerHTML = `

            <div class="no-result">

                <h2>
                    Search Error
                </h2>

                <p>
                    Unable to search colleges.
                </p>

            </div>

        `;

    }

}
// ======================================
// SHOW RESULT
// ======================================

function showResult(data) {

    const result =
        document.getElementById(
            "result"
        );


    result.innerHTML =
        "";


    // ==================================
    // NO RESULT
    // ==================================

    if (
        !Array.isArray(data)

        ||

        data.length === 0
    ) {

        result.innerHTML = `

            <div class="no-result">

                <h2>

                    No College Found 😔

                </h2>

                <p>

                    Try changing Percentile,
                    Category or Branch.

                </p>

            </div>

        `;


        return;

    }


    // ==================================
    // GROUP COLLEGES BY COLLEGE CODE
    // ==================================

    const collegeGroups =
        {};


    data.forEach(c => {

        const collegeCode =
            String(
                c.college_code
            ).trim();


        if (
            !collegeGroups[
                collegeCode
            ]
        ) {

            collegeGroups[
                collegeCode
            ] = {

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

                records:
                    []

            };

        }


        collegeGroups[
            collegeCode
        ].records.push(c);

    });


    // ==================================
    // UNIQUE COLLEGE LIST
    // ==================================

    const colleges =
        Object.values(
            collegeGroups
        );


    // ==================================
    // ELIGIBLE COLLEGE COUNT
    // ==================================

    result.innerHTML = `

        <h2 class="eligible-college-count">

            Eligible Colleges :
            ${colleges.length}

        </h2>

    `;


    // ==================================
    // SHOW COLLEGE CARDS
    // ==================================

    colleges.forEach(college => {


        const instituteCode =
            String(
                college.college_code
            ).padStart(
                5,
                "0"
            );


        const dteUrl =

            `https://fe2025.mahacet.org/StaticPages/frmInstituteSummary?InstituteCode=${instituteCode}`;


        let recordsHtml =
            "";


        // ==================================
        // COLLEGE RECORDS
        // ==================================

        college.records.forEach(c => {


            let color =
                "#16a34a";


            const cutoff =
                Number(
                    c.cutoff
                );


            if (
                cutoff >= 99
            ) {

                color =
                    "#dc2626";

            }

            else if (
                cutoff >= 95
            ) {

                color =
                    "#ea580c";

            }

            else if (
                cutoff >= 90
            ) {

                color =
                    "#2563eb";

            }


            recordsHtml += `

                <div class="college-branch-record">


                    <p>

                        <b>

                            Branch :

                        </b>

                        ${escapeResultHtml(
                            c.branch
                        )}

                    </p>


                    <p>

                        <b>

                            Category :

                        </b>

                        ${escapeResultHtml(
                            formatCategory(
                                c.category
                            )
                        )}

                    </p>


                    <p>

                        <b>

                            Cutoff Percentile :

                        </b>


                        <span style="
                            color:${color};
                            font-weight:bold;
                        ">

                            ${escapeResultHtml(
                                c.cutoff
                            )}

                        </span>

                    </p>


                    <p>

                        <b>

                            Choice Code :

                        </b>

                        ${escapeResultHtml(
                            c.choice_code
                        )}

                    </p>


                </div>

            `;

        });


        // ==================================
        // COLLEGE CARD
        // ==================================

        result.innerHTML += `

            <div class="
                result-card
                grouped-college-card
            ">


                <div class="
                    grouped-college-header
                ">


                    <h2>

                        ${escapeResultHtml(
                            college.college_name
                        )}

                    </h2>


                    <span class="
                        college-code-small
                    ">

                        Code:

                        ${escapeResultHtml(
                            college.college_code
                        )}

                    </span>


                </div>


                <div class="
                    grouped-college-location
                ">


                    <p>

                        <b>

                            District :

                        </b>

                        ${escapeResultHtml(
                            college.district
                        )}

                    </p>


                    <p>

                        <b>

                            Region :

                        </b>

                        ${escapeResultHtml(
                            college.region
                        )}

                    </p>


                    <p>

                        <b>

                            College Type :

                        </b>

                        ${escapeResultHtml(
                            college.college_type
                        )}

                    </p>


                </div>


                <div class="
                    college-record-list
                ">

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


// ======================================
// FORMAT CATEGORY
// ======================================

function formatCategory(category) {

    if (!category) {

        return "";

    }


    const value =
        String(category)
            .trim();


    if (
        value.endsWith("H")
    ) {

        return `${value} (Home University)`;

    }


    if (
        value.endsWith("O")
    ) {

        return `${value} (Other Than Home University)`;

    }


    if (
        value.endsWith("S")
    ) {

        return `${value} (State Level)`;

    }


    if (
        value.startsWith("AI")
    ) {

        return `${value} (All India Seat)`;

    }


    return value;

}


// ======================================
// ESCAPE RESULT HTML
// ======================================

function escapeResultHtml(value) {

    if (
        value === null

        ||

        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// ENTER KEY SUPPORT
// ======================================

document.addEventListener(

    "keypress",

    function (event) {

        if (
            event.key === "Enter"
        ) {

            searchCollege();

        }

    }

);


// ======================================
// PAGE LOAD
// ======================================

window.addEventListener(

    "load",

    function () {

        loadDropdowns();

    }

);