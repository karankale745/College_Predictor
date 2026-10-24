// ==========================================
// MHT CET COLLEGE COMPARE SYSTEM
// ==========================================


// ==========================================
// SELECTED COLLEGES
// ==========================================

let selectedColleges = {

    1: null,

    2: null,

    3: null

};


// ==========================================
// SEARCH TIMERS
// ==========================================

let searchTimers = {

    1: null,

    2: null,

    3: null

};


// ==========================================
// SEARCH COLLEGE
// ==========================================

function searchCollege(number) {

    const input =
        document.getElementById(
            `collegeSearch${number}`
        );


    const suggestionBox =
        document.getElementById(
            `collegeSuggestions${number}`
        );


    const searchText =
        input.value.trim();


    clearTimeout(
        searchTimers[number]
    );


    // ======================================
    // CLEAR CURRENT SELECTION IF USER TYPES
    // ======================================

    if (selectedColleges[number]) {

        selectedColleges[number] = null;


        const selectedCard =
            document.getElementById(
                `selectedCollege${number}`
            );


        selectedCard.style.display =
            "none";


        selectedCard.innerHTML =
            "";

    }


    // ======================================
    // MINIMUM 2 CHARACTERS
    // ======================================

    if (searchText.length < 2) {

        suggestionBox.innerHTML =
            "";


        suggestionBox.classList.remove(
            "show"
        );


        return;

    }


    // ======================================
    // SEARCH DELAY
    // ======================================

    searchTimers[number] =
        setTimeout(

            async function () {

                await loadCollegeSuggestions(
                    number,
                    searchText
                );

            },

            300

        );

}


// ==========================================
// LOAD COLLEGE SUGGESTIONS
// ==========================================

async function loadCollegeSuggestions(
    number,
    searchText
) {

    const suggestionBox =
        document.getElementById(
            `collegeSuggestions${number}`
        );


    suggestionBox.innerHTML = `

        <div class="suggestion-loading">

            Searching colleges...

        </div>

    `;


    suggestionBox.classList.add(
        "show"
    );


    try {

        const response =
            await fetch(

                "/mhtcet_compare_colleges?q=" +

                encodeURIComponent(
                    searchText
                )

            );


        const colleges =
            await response.json();


        suggestionBox.innerHTML =
            "";


        // ==================================
        // NO COLLEGE FOUND
        // ==================================

        if (
            !Array.isArray(colleges)

            ||

            colleges.length === 0
        ) {

            suggestionBox.innerHTML = `

                <div class="suggestion-empty">

                    No college found

                </div>

            `;


            return;

        }


        // ==================================
        // CREATE SUGGESTIONS
        // ==================================

        colleges.forEach(college => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "college-suggestion-item";


            item.innerHTML = `

                <div class="suggestion-code">

                    ${escapeHtml(
                        college.college_code
                    )}

                </div>


                <div class="suggestion-details">

                    <div class="suggestion-name">

                        ${escapeHtml(
                            college.college_name
                        )}

                    </div>


                    <div class="suggestion-location">

                        ${escapeHtml(
                            college.district
                        )}

                        ·

                        ${escapeHtml(
                            college.region
                        )}

                    </div>

                </div>

            `;


            item.addEventListener(

                "click",

                function () {

                    selectCollege(
                        number,
                        college
                    );

                }

            );


            suggestionBox.appendChild(
                item
            );

        });

    }

    catch (error) {

        console.error(
            "College Search Error:",
            error
        );


        suggestionBox.innerHTML = `

            <div class="suggestion-empty">

                Unable to search colleges

            </div>

        `;

    }

}


// ==========================================
// SELECT COLLEGE
// ==========================================

function selectCollege(
    number,
    college
) {

    // ======================================
    // DUPLICATE COLLEGE CHECK
    // ======================================

    const duplicate =
        Object.entries(
            selectedColleges
        ).some(

            ([key, selected]) => {

                if (
                    Number(key) === number
                ) {

                    return false;

                }


                if (!selected) {

                    return false;

                }


                return (

                    String(
                        selected.college_code
                    )

                    ===

                    String(
                        college.college_code
                    )

                );

            }

        );


    if (duplicate) {

        alert(
            "This college is already selected."
        );


        return;

    }


    // ======================================
    // SAVE COLLEGE
    // ======================================

    selectedColleges[number] =
        college;


    // ======================================
    // INPUT
    // ======================================

    const input =
        document.getElementById(
            `collegeSearch${number}`
        );


    input.value =
        college.college_name;


    // ======================================
    // CLOSE SUGGESTIONS
    // ======================================

    const suggestionBox =
        document.getElementById(
            `collegeSuggestions${number}`
        );


    suggestionBox.innerHTML =
        "";


    suggestionBox.classList.remove(
        "show"
    );


    // ======================================
    // SELECTED COLLEGE CARD
    // ======================================

    const selectedCard =
        document.getElementById(
            `selectedCollege${number}`
        );


    selectedCard.innerHTML = `

        <div class="selected-college-info">

            <div class="selected-check">

                ✓

            </div>


            <div class="selected-college-details">

                <div class="selected-college-name">

                    ${escapeHtml(
                        college.college_name
                    )}

                </div>


                <div class="selected-college-meta">

                    Code:

                    <strong>

                        ${escapeHtml(
                            college.college_code
                        )}

                    </strong>

                    <span>•</span>

                    ${escapeHtml(
                        college.district
                    )}

                    <span>•</span>

                    ${escapeHtml(
                        college.college_type
                    )}

                </div>

            </div>


            <button
                type="button"
                class="remove-selected-college"
                onclick="removeSelectedCollege(${number})"
            >

                ✕

            </button>

        </div>

    `;


    selectedCard.style.display =
        "block";

}


// ==========================================
// REMOVE SELECTED COLLEGE
// ==========================================

function removeSelectedCollege(number) {

    selectedColleges[number] =
        null;


    const input =
        document.getElementById(
            `collegeSearch${number}`
        );


    input.value =
        "";


    const selectedCard =
        document.getElementById(
            `selectedCollege${number}`
        );


    selectedCard.innerHTML =
        "";


    selectedCard.style.display =
        "none";


    const suggestionBox =
        document.getElementById(
            `collegeSuggestions${number}`
        );


    suggestionBox.innerHTML =
        "";


    suggestionBox.classList.remove(
        "show"
    );

}


// ==========================================
// COMPARE COLLEGES
// ==========================================

async function compareColleges() {

    const colleges =
        Object.values(
            selectedColleges
        ).filter(
            college => college !== null
        );


    // ======================================
    // MINIMUM 2 COLLEGES
    // ======================================

    if (colleges.length < 2) {

        alert(
            "Please select minimum 2 colleges."
        );


        return;

    }


    // ======================================
    // COLLEGE CODES
    // ======================================

    const collegeCodes =
        colleges.map(

            college =>
                college.college_code

        );


    const loading =
        document.getElementById(
            "compareLoading"
        );


    const result =
        document.getElementById(
            "compareResult"
        );


    loading.style.display =
        "flex";


    result.innerHTML =
        "";


    try {

        const response =
            await fetch(

                "/mhtcet_compare_data",

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            college_codes:
                                collegeCodes

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

                "Unable to compare colleges."

            );


            return;

        }


        // ==================================
        // SHOW COMPARE RESULT
        // ==================================

        showCompareResult(
            data
        );


        // ==================================
        // SCROLL TO RESULT
        // ==================================

        result.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

    catch (error) {

        loading.style.display =
            "none";


        console.error(
            "Compare Error:",
            error
        );


        alert(
            "Server error. Please try again."
        );

    }

}


// ==========================================
// SHOW COMPARE RESULT
// ==========================================

function showCompareResult(colleges) {

    const result =
        document.getElementById(
            "compareResult"
        );


    result.innerHTML =
        "";


    if (

        !Array.isArray(colleges)

        ||

        colleges.length < 2

    ) {

        result.innerHTML = `

            <div class="compare-no-result">

                Unable to compare selected colleges.

            </div>

        `;


        return;

    }


    // ======================================
    // RESULT TITLE
    // ======================================

    const title =
        document.createElement(
            "div"
        );


    title.className =
        "compare-result-heading";


    title.innerHTML = `

        <h2>

            College Comparison

        </h2>


        <p>

            Branch and category-wise
            MHT CET cutoff comparison

        </p>

    `;


    result.appendChild(
        title
    );


    // ======================================
    // BASIC COLLEGE DETAILS
    // ======================================

    result.appendChild(

        createCollegeDetailsTable(
            colleges
        )

    );


    // ======================================
    // GET ALL BRANCHES
    // ======================================

    const branchSet =
        new Set();


    colleges.forEach(college => {

        Object.keys(

            college.branches || {}

        ).forEach(branch => {

            branchSet.add(
                branch
            );

        });

    });


    const branches =
        Array.from(
            branchSet
        ).sort(

            (a, b) =>
                a.localeCompare(b)

        );


    // ======================================
    // BRANCH TABLES
    // ======================================

    branches.forEach(

        (branch, index) => {

            const branchSection =
                createBranchCompareTable(

                    colleges,

                    branch,

                    index + 1

                );


            result.appendChild(
                branchSection
            );

        }

    );

}


// ==========================================
// CREATE COLLEGE DETAILS TABLE
// ==========================================

function createCollegeDetailsTable(
    colleges
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "compare-table-wrapper college-details-wrapper";


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "compare-data-table";


    // ======================================
    // HEADER
    // ======================================

    let html = `

        <thead>

            <tr>

                <th class="compare-label-column">

                    College Details

                </th>

    `;


    colleges.forEach(

        (college, index) => {

            html += `

                <th>

                    College ${index + 1}

                </th>

            `;

        }

    );


    html += `

            </tr>

        </thead>

        <tbody>

    `;


    // ======================================
    // DETAILS ROWS
    // ======================================

    const rows = [

        {

            label:
                "College Code",

            value:
                college =>
                    college.college_code

        },

        {

            label:
                "College Name",

            value:
                college =>
                    college.college_name

        },

        {

            label:
                "District",

            value:
                college =>
                    college.district

        },

        {

            label:
                "Region",

            value:
                college =>
                    college.region

        },

        {

            label:
                "College Type",

            value:
                college =>
                    college.college_type

        }

    ];


    rows.forEach(row => {

        html += `

            <tr>

                <td class="compare-label-column">

                    ${escapeHtml(
                        row.label
                    )}

                </td>

        `;


        colleges.forEach(college => {

            html += `

                <td>

                    ${escapeHtml(
                        safeValue(
                            row.value(
                                college
                            )
                        )
                    )}

                </td>

            `;

        });


        html += `

            </tr>

        `;

    });


    html += `

        </tbody>

    `;


    table.innerHTML =
        html;


    wrapper.appendChild(
        table
    );


    return wrapper;

}


// ==========================================
// CREATE BRANCH COMPARE TABLE
// ==========================================

function createBranchCompareTable(
    colleges,
    branch,
    branchNumber
) {

    const section =
        document.createElement(
            "div"
        );


    section.className =
        "branch-compare-section";


    // ======================================
    // BRANCH TITLE
    // ======================================

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "branch-compare-heading";


    heading.innerHTML = `

        <div class="branch-number">

            ${branchNumber}

        </div>


        <div>

            <h3>

                ${escapeHtml(
                    branch
                )}

            </h3>


            <p>

                Category-wise cutoff percentile

            </p>

        </div>

    `;


    section.appendChild(
        heading
    );


    // ======================================
    // GET ALL CATEGORIES FOR BRANCH
    // ======================================

    const categorySet =
        new Set();


    colleges.forEach(college => {

        const branchData =

            college.branches

            &&

            college.branches[branch];


        if (!branchData) {

            return;

        }


        Object.keys(
            branchData
        ).forEach(category => {

            categorySet.add(
                category
            );

        });

    });


    const categories =
        Array.from(
            categorySet
        ).sort(
            categorySort
        );


    // ======================================
    // TABLE WRAPPER
    // ======================================

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "compare-table-wrapper";


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "compare-data-table cutoff-compare-table";


    // ======================================
    // TABLE HEADER
    // ======================================

    let html = `

        <thead>

            <tr>

                <th class="compare-label-column">

                    Category

                </th>

    `;


    colleges.forEach(college => {

        html += `

            <th>

                <div class="compare-college-code">

                    ${escapeHtml(
                        college.college_code
                    )}

                </div>


                <div class="compare-college-short-name">

                    ${escapeHtml(
                        getShortCollegeName(
                            college.college_name
                        )
                    )}

                </div>

            </th>

        `;

    });


    html += `

            </tr>

        </thead>

        <tbody>

    `;


    // ======================================
    // CATEGORY ROWS
    // ======================================

    categories.forEach(category => {

        html += `

            <tr>

                <td class="compare-label-column category-label">

                    <div>

                        ${escapeHtml(
                            category
                        )}

                    </div>


                    <small>

                        ${escapeHtml(
                            getCategoryLegend(
                                category
                            )
                        )}

                    </small>

                </td>

        `;


        colleges.forEach(college => {

            const branchData =

                college.branches

                &&

                college.branches[branch];


            let cutoff =
                null;


            if (

                branchData

                &&

                Object.prototype.hasOwnProperty.call(

                    branchData,

                    category

                )

            ) {

                cutoff =
                    branchData[category];

            }


            html += `

                <td>

                    ${formatCutoff(
                        cutoff
                    )}

                </td>

            `;

        });


        html += `

            </tr>

        `;

    });


    html += `

        </tbody>

    `;


    table.innerHTML =
        html;


    wrapper.appendChild(
        table
    );


    section.appendChild(
        wrapper
    );


    return section;

}


// ==========================================
// FORMAT CUTOFF
// ==========================================

function formatCutoff(cutoff) {

    if (

        cutoff === null

        ||

        cutoff === undefined

        ||

        cutoff === ""

    ) {

        return `

            <span class="cutoff-not-available">

                -

            </span>

        `;

    }


    const value =
        Number(cutoff);


    if (isNaN(value)) {

        return `

            <span class="cutoff-not-available">

                -

            </span>

        `;

    }


    return `

        <span class="compare-cutoff-value">

            ${escapeHtml(
                formatNumber(value)
            )}

        </span>

    `;

}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatNumber(value) {

    const number =
        Number(value);


    if (isNaN(number)) {

        return "-";

    }


    return number
        .toFixed(5)
        .replace(
            /0+$/,
            ""
        )
        .replace(
            /\.$/,
            ""
        );

}


// ==========================================
// CATEGORY SORT
// ==========================================

function categorySort(a, b) {

    const categoryOrder = [

        "GOPENH",
        "LOPENH",

        "GOPENO",
        "LOPENO",

        "GSCH",
        "LSCH",

        "GSCO",
        "LSCO",

        "GSTH",
        "LSTH",

        "GSTO",
        "LSTO",

        "GVJH",
        "LVJH",

        "GVJO",
        "LVJO",

        "GNT1H",
        "LNT1H",

        "GNT1O",
        "LNT1O",

        "GNT2H",
        "LNT2H",

        "GNT2O",
        "LNT2O",

        "GNT3H",
        "LNT3H",

        "GNT3O",
        "LNT3O",

        "GOBCH",
        "LOBCH",

        "GOBCO",
        "LOBCO",

        "GSEBCH",
        "LSEBCH",

        "GSEBCO",
        "LSEBCO",

        "EWS",

        "TFWS",

        "PWDOPENH",

        "PWDOPENO",

        "DEFOPENS",

        "DEFROBCS",

        "ORPHAN"

    ];


    const indexA =
        categoryOrder.indexOf(a);


    const indexB =
        categoryOrder.indexOf(b);


    if (
        indexA !== -1

        &&

        indexB !== -1
    ) {

        return indexA - indexB;

    }


    if (indexA !== -1) {

        return -1;

    }


    if (indexB !== -1) {

        return 1;

    }


    return a.localeCompare(b);

}


// ==========================================
// GET CATEGORY LEGEND
// ==========================================

function getCategoryLegend(category) {

    if (!category) {

        return "";

    }


    const value =
        String(category)
            .trim()
            .toUpperCase();


    const legends = [];


    // ======================================
    // START CHARACTER
    // ======================================

    if (value.startsWith("G")) {

        legends.push(
            "General"
        );

    }


    else if (
        value.startsWith("L")
    ) {

        legends.push(
            "Ladies"
        );

    }


    // ======================================
    // END CHARACTER
    // ======================================

    if (value.endsWith("H")) {

        legends.push(
            "Home University"
        );

    }


    else if (
        value.endsWith("O")
    ) {

        legends.push(
            "Other Than Home University"
        );

    }


    else if (
        value.endsWith("S")
    ) {

        legends.push(
            "State Level"
        );

    }


    // ======================================
    // SPECIAL CATEGORY
    // ======================================

    if (value === "TFWS") {

        return (
            "Tuition Fee Waiver Scheme"
        );

    }


    if (value === "EWS") {

        return (
            "Economically Weaker Section"
        );

    }


    if (value === "ORPHAN") {

        return "Orphan";

    }


    return legends.join(
        " · "
    );

}


// ==========================================
// GET SHORT COLLEGE NAME
// ==========================================

function getShortCollegeName(name) {

    if (!name) {

        return "-";

    }


    const cleanName =
        String(name).trim();


    if (cleanName.length <= 45) {

        return cleanName;

    }


    return (

        cleanName.substring(
            0,
            42
        )

        +

        "..."

    );

}


// ==========================================
// SAFE VALUE
// ==========================================

function safeValue(value) {

    if (

        value === undefined

        ||

        value === null

        ||

        value === ""

    ) {

        return "-";

    }


    return String(value);

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (

        value === undefined

        ||

        value === null

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


// ==========================================
// CLOSE SUGGESTIONS OUTSIDE CLICK
// ==========================================

document.addEventListener(

    "click",

    function (event) {

        if (

            !event.target.closest(
                ".college-search-wrapper"
            )

        ) {

            document
                .querySelectorAll(
                    ".college-suggestions"
                )
                .forEach(

                    suggestionBox => {

                        suggestionBox.classList.remove(
                            "show"
                        );

                    }

                );

        }

    }

);