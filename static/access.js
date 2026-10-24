// ==========================================
// HANDLE LOGIN / PAYMENT LOCK
// ==========================================

async function handleLockedResponse(response) {

    if (
        response.status === 401
        ||
        response.status === 403
    ) {

        saveCurrentFormData();

        savePendingAction();

        sessionStorage.setItem(
            "return_after_access",
            window.location.pathname
        );


        if (response.status === 401) {

            window.location.href =
                "/login";

        }

        else {

            window.location.href =
                "/unlock";

        }


        return true;

    }


    return false;

}


// ==========================================
// SAVE CURRENT FORM DATA
// ==========================================

function saveCurrentFormData() {

    const path =
        window.location.pathname;


    // ======================================
    // MHT CET PREDICTOR
    // ======================================

    if (
        path.includes(
            "mhtcet_predictor"
        )
    ) {

        const data = {

            percentile:
                getElementValue(
                    "percentile"
                ),

            category:
                getElementValue(
                    "category"
                ),

            branch:
                getElementValue(
                    "branch"
                ),

            region:
                getElementValue(
                    "region"
                ),

            district:
                getElementValue(
                    "district"
                ),

            college_type:
                getElementValue(
                    "college_type"
                )

        };


        sessionStorage.setItem(

            "mhtcet_predict_form",

            JSON.stringify(
                data
            )

        );

    }


    // ======================================
    // DSE PREDICTOR
    // ======================================

    else if (
        path.includes(
            "dse_predictor"
        )
    ) {

        const data = {

            percentage:
                getElementValue(
                    "percentage"
                ),

            category:
                getElementValue(
                    "category"
                ),

            branch:
                getElementValue(
                    "branch"
                ),

            region:
                getElementValue(
                    "region"
                ),

            district:
                getElementValue(
                    "district"
                ),

            college_type:
                getElementValue(
                    "college_type"
                )

        };


        sessionStorage.setItem(

            "dse_predict_form",

            JSON.stringify(
                data
            )

        );

    }

}


// ==========================================
// GET ELEMENT VALUE
// ==========================================

function getElementValue(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "ALL";

    }


    return element.value;

}


// ==========================================
// SAVE CURRENT ACTION
// ==========================================

function savePendingAction() {

    const path =
        window.location.pathname;


    let action = null;


    if (
        path.includes(
            "mhtcet_predictor"
        )
    ) {

        action =
            "mhtcet_predict";

    }


    else if (
        path.includes(
            "dse_predictor"
        )
    ) {

        action =
            "dse_predict";

    }


    else if (
        path.includes(
            "search_cet"
        )
    ) {

        action =
            "search_cet";

    }


    else if (
        path.includes(
            "search_dse"
        )
    ) {

        action =
            "search_dse";

    }


    else if (
        path.includes(
            "compare_cet"
        )
    ) {

        action =
            "compare_cet";

    }


    else if (
        path.includes(
            "compare_dse"
        )
    ) {

        action =
            "compare_dse";

    }


    if (action) {

        sessionStorage.setItem(

            "pending_access_action",

            action

        );

    }

}


// ==========================================
// RESTORE SELECT VALUE
// ==========================================

function restoreSelectValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
        ||
        value === null
        ||
        value === undefined
    ) {

        return;

    }


    const optionExists =

        Array.from(
            element.options
        ).some(

            option =>
                option.value === value

        );


    if (optionExists) {

        element.value =
            value;

    }

}


// ==========================================
// RESTORE MHT CET FORM
// ==========================================

async function restoreMhtcetForm() {

    const saved =
        sessionStorage.getItem(
            "mhtcet_predict_form"
        );


    if (!saved) {

        return;

    }


    const data =
        JSON.parse(
            saved
        );


    const percentile =
        document.getElementById(
            "percentile"
        );


    if (percentile) {

        percentile.value =
            data.percentile || "";

    }


    restoreSelectValue(
        "category",
        data.category
    );


    restoreSelectValue(
        "branch",
        data.branch
    );


    restoreSelectValue(
        "region",
        data.region
    );


    // LOAD DISTRICTS FOR SAVED REGION

    if (
        typeof loadDistricts ===
        "function"
    ) {

        await loadDistricts();

    }


    restoreSelectValue(
        "district",
        data.district
    );


    restoreSelectValue(
        "college_type",
        data.college_type
    );

}


// ==========================================
// RESTORE DSE FORM
// ==========================================

async function restoreDseForm() {

    const saved =
        sessionStorage.getItem(
            "dse_predict_form"
        );


    if (!saved) {

        return;

    }


    const data =
        JSON.parse(
            saved
        );


    const percentage =
        document.getElementById(
            "percentage"
        );


    if (percentage) {

        percentage.value =
            data.percentage || "";

    }


    restoreSelectValue(
        "category",
        data.category
    );


    restoreSelectValue(
        "branch",
        data.branch
    );


    restoreSelectValue(
        "region",
        data.region
    );


    // LOAD DISTRICTS FOR SAVED REGION

    if (
        typeof loadDistricts ===
        "function"
    ) {

        await loadDistricts();

    }


    restoreSelectValue(
        "district",
        data.district
    );


    restoreSelectValue(
        "college_type",
        data.college_type
    );

}


// ==========================================
// RUN SAVED ACTION
// ==========================================

async function runPendingAccessAction() {

    const action =
        sessionStorage.getItem(
            "pending_access_action"
        );


    if (!action) {

        return;

    }


    // ======================================
    // MHT CET PREDICT
    // ======================================

    if (
        action ===
        "mhtcet_predict"
    ) {

        await restoreMhtcetForm();


        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof searchCollege ===
            "function"
        ) {

            await searchCollege();

        }


        sessionStorage.removeItem(
            "mhtcet_predict_form"
        );


        return;

    }


    // ======================================
    // DSE PREDICT
    // ======================================

    if (
        action ===
        "dse_predict"
    ) {

        await restoreDseForm();


        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof searchCollege ===
            "function"
        ) {

            await searchCollege();

        }


        sessionStorage.removeItem(
            "dse_predict_form"
        );


        return;

    }


    // ======================================
    // SEARCH CET
    // ======================================

    if (
        action ===
        "search_cet"
    ) {

        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof loadCollegeDetails ===
            "function"
        ) {

            await loadCollegeDetails();

        }


        return;

    }


    // ======================================
    // SEARCH DSE
    // ======================================

    if (
        action ===
        "search_dse"
    ) {

        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof loadCollegeDetails ===
            "function"
        ) {

            await loadCollegeDetails();

        }


        return;

    }


    // ======================================
    // COMPARE CET
    // ======================================

    if (
        action ===
        "compare_cet"
    ) {

        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof compareColleges ===
            "function"
        ) {

            await compareColleges();

        }


        return;

    }


    // ======================================
    // COMPARE DSE
    // ======================================

    if (
        action ===
        "compare_dse"
    ) {

        sessionStorage.removeItem(
            "pending_access_action"
        );


        if (
            typeof compareColleges ===
            "function"
        ) {

            await compareColleges();

        }

    }

}


// ==========================================
// WAIT FOR DROPDOWNS
// ==========================================

async function waitForDropdowns() {

    let attempts = 0;


    while (
        attempts < 50
    ) {

        const category =
            document.getElementById(
                "category"
            );


        const branch =
            document.getElementById(
                "branch"
            );


        if (
            category
            &&
            branch
            &&
            category.options.length > 1
            &&
            branch.options.length > 1
        ) {

            return true;

        }


        await new Promise(

            resolve =>
                setTimeout(
                    resolve,
                    100
                )

        );


        attempts++;

    }


    return false;

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    async function () {

        const action =
            sessionStorage.getItem(
                "pending_access_action"
            );


        if (!action) {

            return;

        }


        // WAIT DROPDOWN API

        if (
            action ===
            "mhtcet_predict"
            ||
            action ===
            "dse_predict"
        ) {

            await waitForDropdowns();

        }


        await runPendingAccessAction();

    }

);