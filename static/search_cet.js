// ==========================================
// MHT CET COLLEGE SEARCH SYSTEM
// ==========================================


// ==========================================
// SELECTED COLLEGE
// ==========================================

let selectedSearchCollege = null;


// ==========================================
// SEARCH TIMER
// ==========================================

let collegeSearchTimer = null;


// ==========================================
// SEARCH COLLEGE
// ==========================================

function searchCollege() {

    const input =
        document.getElementById(
            "collegeSearch"
        );


    const suggestionBox =
        document.getElementById(
            "collegeSuggestions"
        );


    const selectedCard =
        document.getElementById(
            "selectedSearchCollege"
        );


    const viewButton =
        document.getElementById(
            "viewCollegeBtn"
        );


    const searchText =
        input.value.trim();


    clearTimeout(
        collegeSearchTimer
    );


    // ======================================
    // CLEAR OLD SELECTED COLLEGE
    // ======================================

    if (selectedSearchCollege) {

        selectedSearchCollege = null;


        selectedCard.innerHTML =
            "";


        selectedCard.style.display =
            "none";


        viewButton.disabled =
            true;

    }


    // ======================================
    // CLEAR OLD RESULT
    // ======================================

    document.getElementById(
        "collegeSearchResult"
    ).innerHTML = "";


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

    collegeSearchTimer =
        setTimeout(

            async function () {

                await loadCollegeSuggestions(
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
    searchText
) {

    const suggestionBox =
        document.getElementById(
            "collegeSuggestions"
        );


    suggestionBox.innerHTML = `

        <div class="single-suggestion-loading">

            Searching colleges...

        </div>

    `;


    suggestionBox.classList.add(
        "show"
    );


    try {

        const response =
            await fetch(

                "/search_cet_colleges?q="

                +

                encodeURIComponent(
                    searchText
                )

            );


        if (!response.ok) {

            throw new Error(
                "College search request failed."
            );

        }


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

                <div class="single-suggestion-empty">

                    No college found

                </div>

            `;


            return;

        }


        // ==================================
        // CREATE COLLEGE SUGGESTIONS
        // ==================================

        colleges.forEach(college => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "single-college-suggestion-item";


            item.innerHTML = `

                <div class="single-suggestion-code">

                    ${escapeHtml(
                        college.college_code
                    )}

                </div>


                <div class="single-suggestion-details">


                    <div class="single-suggestion-name">

                        ${escapeHtml(
                            college.college_name
                        )}

                    </div>


                    <div class="single-suggestion-location">

                        ${escapeHtml(
                            college.district
                        )}

                        <span>•</span>

                        ${escapeHtml(
                            college.region
                        )}

                        <span>•</span>

                        ${escapeHtml(
                            college.college_type
                        )}

                    </div>


                </div>

            `;


            item.addEventListener(

                "click",

                function () {

                    selectSearchCollege(
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

            <div class="single-suggestion-empty">

                Unable to search colleges

            </div>

        `;

    }

}


// ==========================================
// SELECT COLLEGE
// ==========================================

function selectSearchCollege(college) {

    selectedSearchCollege =
        college;


    const input =
        document.getElementById(
            "collegeSearch"
        );


    const suggestionBox =
        document.getElementById(
            "collegeSuggestions"
        );


    const selectedCard =
        document.getElementById(
            "selectedSearchCollege"
        );


    const viewButton =
        document.getElementById(
            "viewCollegeBtn"
        );


    // ======================================
    // SET INPUT VALUE
    // ======================================

    input.value =
        college.college_name;


    // ======================================
    // CLOSE SUGGESTIONS
    // ======================================

    suggestionBox.innerHTML =
        "";


    suggestionBox.classList.remove(
        "show"
    );


    // ======================================
    // SELECTED COLLEGE CARD
    // ======================================

    selectedCard.innerHTML = `

        <div class="single-selected-info">


            <div class="single-selected-check">

                ✓

            </div>


            <div class="single-selected-details">


                <div class="single-selected-name">

                    ${escapeHtml(
                        college.college_name
                    )}

                </div>


                <div class="single-selected-meta">

                    <span>

                        Code:

                        <strong>

                            ${escapeHtml(
                                college.college_code
                            )}

                        </strong>

                    </span>


                    <span>•</span>


                    <span>

                        ${escapeHtml(
                            college.district
                        )}

                    </span>


                    <span>•</span>


                    <span>

                        ${escapeHtml(
                            college.college_type
                        )}

                    </span>


                </div>


            </div>


            <button
                type="button"
                class="single-remove-selected"
                onclick="removeSearchCollege()"
            >

                ✕

            </button>


        </div>

    `;


    selectedCard.style.display =
        "block";


    // ======================================
    // ENABLE VIEW BUTTON
    // ======================================

    viewButton.disabled =
        false;

}


// ==========================================
// REMOVE SELECTED COLLEGE
// ==========================================

function removeSearchCollege() {

    selectedSearchCollege =
        null;


    document.getElementById(
        "collegeSearch"
    ).value = "";


    const selectedCard =
        document.getElementById(
            "selectedSearchCollege"
        );


    selectedCard.innerHTML =
        "";


    selectedCard.style.display =
        "none";


    document.getElementById(
        "viewCollegeBtn"
    ).disabled = true;


    document.getElementById(
        "collegeSuggestions"
    ).innerHTML = "";


    document.getElementById(
        "collegeSuggestions"
    ).classList.remove(
        "show"
    );


    document.getElementById(
        "collegeSearchResult"
    ).innerHTML = "";

}


// ==========================================
// LOAD COLLEGE DETAILS
// ==========================================

async function loadCollegeDetails() {

    if (!selectedSearchCollege) {

        alert(
            "Please select a college."
        );


        return;

    }


    const loading =
        document.getElementById(
            "collegeSearchLoading"
        );


    const result =
        document.getElementById(
            "collegeSearchResult"
        );


    const viewButton =
        document.getElementById(
            "viewCollegeBtn"
        );


    loading.style.display =
        "flex";


    result.innerHTML =
        "";


    viewButton.disabled =
        true;


    try {

        const response =
            await fetch(

                "/search_cet_data",

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            college_code:
                                selectedSearchCollege
                                .college_code

                        })

                }

            );


        // ==========================================
// CHECK LOGIN / PAYMENT ACCESS
// ==========================================

if (
    await handleLockedResponse(
        response
    )
) {

    loading.style.display =
        "none";

    viewButton.disabled =
        false;

    return;

}


// ==========================================
// GET RESPONSE DATA
// ==========================================

const data =
    await response.json();


loading.style.display =
    "none";


viewButton.disabled =
    false;


// ==========================================
// CHECK API ERROR
// ==========================================

if (!response.ok) {

    alert(

        data.error

        ||

        "Unable to load college details."

    );

    return;

}


// ==========================================
// SHOW COLLEGE DETAILS
// ==========================================

showCollegeDetails(
    data
);


// ==========================================
// SCROLL TO RESULT
// ==========================================

result.scrollIntoView({

    behavior:
        "smooth",

    block:
        "start"

});
        // ==================================
        // SHOW COLLEGE DETAILS
        // ==================================

        showCollegeDetails(
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


        viewButton.disabled =
            false;


        console.error(
            "College Details Error:",
            error
        );


        alert(
            "Server error. Please try again."
        );

    }

}


// ==========================================
// SHOW COLLEGE DETAILS
// ==========================================

function showCollegeDetails(college) {

    const result =
        document.getElementById(
            "collegeSearchResult"
        );


    result.innerHTML =
        "";


    if (!college) {

        result.innerHTML = `

            <div class="single-search-no-result">

                College details not available.

            </div>

        `;


        return;

    }


    // ======================================
    // RESULT HEADING
    // ======================================

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "single-result-heading";


    heading.innerHTML = `

        <h2>

            College Details

        </h2>


        <p>

            MHT CET branch and
            category-wise cutoff percentile

        </p>

    `;


    result.appendChild(
        heading
    );


    // ======================================
    // COLLEGE INFORMATION CARD
    // ======================================

    result.appendChild(

        createCollegeInformationCard(
            college
        )

    );


    // ======================================
    // GET BRANCHES
    // ======================================

    const branches =
        Object.keys(
            college.branches || {}
        ).sort(

            (a, b) =>
                a.localeCompare(b)

        );


    // ======================================
    // NO BRANCH DATA
    // ======================================

    if (branches.length === 0) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "single-search-no-result";


        empty.innerHTML =

            "No branch cutoff data available.";


        result.appendChild(
            empty
        );


        return;

    }


    // ======================================
    // CREATE BRANCH TABLES
    // ======================================

    branches.forEach(

        (branch, index) => {

            result.appendChild(

                createSearchBranchTable(

                    college,

                    branch,

                    index + 1

                )

            );

        }

    );

}


// ==========================================
// CREATE COLLEGE INFORMATION CARD
// ==========================================

function createCollegeInformationCard(
    college
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "search-college-information-card";


    // ======================================
    // DTE COLLEGE URL
    // ======================================

    const instituteCode =
        String(
            college.college_code
        ).padStart(
            5,
            "0"
        );


    const dteUrl =

        `https://fe2025.mahacet.org/StaticPages/frmInstituteSummary?InstituteCode=${instituteCode}`;


    card.innerHTML = `

        <div class="search-college-title-area">


            <div class="search-college-code-badge">

                ${escapeHtml(
                    college.college_code
                )}

            </div>


            <div class="search-college-title-details">


                <h2>

                    ${escapeHtml(
                        college.college_name
                    )}

                </h2>


                <p>

                    MHT CET Engineering Institute

                </p>


            </div>


        </div>


        <div class="search-college-info-grid">


            <div class="search-info-item">

                <span class="search-info-label">

                    College Code

                </span>

                <strong>

                    ${escapeHtml(
                        college.college_code
                    )}

                </strong>

            </div>


            <div class="search-info-item">

                <span class="search-info-label">

                    District

                </span>

                <strong>

                    ${escapeHtml(
                        safeValue(
                            college.district
                        )
                    )}

                </strong>

            </div>


            <div class="search-info-item">

                <span class="search-info-label">

                    Region

                </span>

                <strong>

                    ${escapeHtml(
                        safeValue(
                            college.region
                        )
                    )}

                </strong>

            </div>


            <div class="search-info-item">

                <span class="search-info-label">

                    College Type

                </span>

                <strong>

                    ${escapeHtml(
                        safeValue(
                            college.college_type
                        )
                    )}

                </strong>

            </div>


        </div>


        <div class="search-college-action">


            <a
                href="${dteUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="search-dte-button"
            >

                🌐 Visit DTE Portal

            </a>


        </div>

    `;


    return card;

}


// ==========================================
// CREATE BRANCH CUTOFF TABLE
// ==========================================

function createSearchBranchTable(
    college,
    branch,
    branchNumber
) {

    const section =
        document.createElement(
            "div"
        );


    section.className =
        "search-branch-section";


    // ======================================
    // BRANCH HEADING
    // ======================================

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "search-branch-heading";


    heading.innerHTML = `

        <div class="search-branch-number">

            ${branchNumber}

        </div>


        <div class="search-branch-title">


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
    // BRANCH DATA
    // ======================================

    const branchData =

        college.branches[branch]

        ||

        {};


    const categories =
        Object.keys(
            branchData
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
        "single-cutoff-table-wrapper";


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "single-cutoff-table";


    let html = `

        <thead>

            <tr>

                <th>

                    Category

                </th>


                <th>

                    Seat Type

                </th>


                <th>

                    Cutoff Percentile

                </th>

            </tr>

        </thead>


        <tbody>

    `;


    // ======================================
    // CATEGORY ROWS
    // ======================================

    categories.forEach(category => {

        const cutoff =
            branchData[category];


        html += `

            <tr>


                <td>

                    <div class="single-category-code">

                        ${escapeHtml(
                            category
                        )}

                    </div>


                    <small>

                        ${escapeHtml(
                            getCategoryType(
                                category
                            )
                        )}

                    </small>

                </td>


                <td>

                    ${escapeHtml(
                        getSeatType(
                            category
                        )
                    )}

                </td>


                <td>

                    ${formatSearchCutoff(
                        cutoff
                    )}

                </td>


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

function formatSearchCutoff(cutoff) {

    if (
        cutoff === null

        ||

        cutoff === undefined

        ||

        cutoff === ""
    ) {

        return `

            <span class="single-cutoff-na">

                -

            </span>

        `;

    }


    const value =
        Number(cutoff);


    if (isNaN(value)) {

        return `

            <span class="single-cutoff-na">

                -

            </span>

        `;

    }


    return `

        <span class="single-cutoff-value">

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
// GET CATEGORY TYPE
// ==========================================

function getCategoryType(category) {

    if (!category) {

        return "";

    }


    const value =
        String(category)
            .trim()
            .toUpperCase();


    const types = [];


    if (value.startsWith("G")) {

        types.push(
            "General"
        );

    }


    else if (
        value.startsWith("L")
    ) {

        types.push(
            "Ladies"
        );

    }


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


    return types.join(
        " · "
    );

}


// ==========================================
// GET SEAT TYPE
// ==========================================

function getSeatType(category) {

    if (!category) {

        return "-";

    }


    const value =
        String(category)
            .trim()
            .toUpperCase();


    if (value.endsWith("H")) {

        return "Home University";

    }


    if (value.endsWith("O")) {

        return (
            "Other Than Home University"
        );

    }


    if (value.endsWith("S")) {

        return "State Level";

    }


    if (
        value.startsWith("AI")

        ||

        value === "AI"
    ) {

        return "All India Seat";

    }


    return "-";

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


    const valueA =
        String(a).toUpperCase();


    const valueB =
        String(b).toUpperCase();


    const indexA =
        categoryOrder.indexOf(
            valueA
        );


    const indexB =
        categoryOrder.indexOf(
            valueB
        );


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


    return valueA.localeCompare(
        valueB
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
// CLOSE SUGGESTIONS ON OUTSIDE CLICK
// ==========================================

document.addEventListener(

    "click",

    function (event) {

        if (
            !event.target.closest(
                ".single-search-wrapper"
            )
        ) {

            const suggestionBox =
                document.getElementById(
                    "collegeSuggestions"
                );


            suggestionBox.classList.remove(
                "show"
            );

        }

    }

);


// ==========================================
// OPEN SUGGESTIONS ON INPUT FOCUS
// ==========================================

document
    .getElementById(
        "collegeSearch"
    )
    .addEventListener(

        "focus",

        function () {

            const suggestionBox =
                document.getElementById(
                    "collegeSuggestions"
                );


            if (
                suggestionBox.children.length > 0
            ) {

                suggestionBox.classList.add(
                    "show"
                );

            }

        }

    );


// ==========================================
// ENTER KEY SUPPORT
// ==========================================

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Enter"

            &&

            selectedSearchCollege
        ) {

            event.preventDefault();


            loadCollegeDetails();

        }

    }

);