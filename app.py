from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
from datetime import timedelta
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import json

load_dotenv()

from database import init_database
from auth import auth_bp
from payment import payment_bp, require_access

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("SECRET_KEY is missing in .env")

# ==========================================
# PRODUCTION / SESSION SECURITY
# ==========================================

app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,
    x_host=1
)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=(
        os.getenv("COOKIE_SECURE", "false").lower()
        == "true"
    ),
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=timedelta(days=30),
    MAX_CONTENT_LENGTH=1 * 1024 * 1024
)
from flask_limiter import Limiter

from flask_limiter.util import get_remote_address


limiter = Limiter(

    key_func=get_remote_address,

    app=app,

    default_limits=[
        "200 per day",
        "50 per hour"
    ]

)

# ==========================================
# SECURITY HEADERS
# ==========================================

@app.after_request
def add_security_headers(response):

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = (
        "strict-origin-when-cross-origin"
    )
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    return response

app.register_blueprint(auth_bp)
app.register_blueprint(payment_bp)

init_database()

# ==========================================
# Load DSE JSON
# ==========================================

with open(
    "colleges.json",
    "r",
    encoding="utf-8"
) as f:

    dse_colleges = json.load(f)

print("DSE Records :", len(dse_colleges))

# ==========================================
# Load MHT CET JSON
# ==========================================

with open(
    "mhtcet_colleges.json",
    "r",
    encoding="utf-8"
) as f:

    mhtcet_colleges = json.load(f)

print("MHT CET Records :", len(mhtcet_colleges))

# ==========================================
# Home
# ==========================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )

# ==========================================
# DSE Predictor Page
# ==========================================

# ==========================================
# MHT CET MAIN PAGE
# ==========================================

@app.route("/mhtcet")
def mhtcet():

    return render_template(
        "mhtcet.html"
    )


# ==========================================
# MHT CET PREDICTOR
# ==========================================

@app.route("/mhtcet_predictor")
def mhtcet_predictor():

    return render_template(
        "mhtcet_predictor.html"
    )


# ==========================================
# MHT CET SEARCH COLLEGE
# ==========================================

@app.route("/search_cet")
def search_cet():

    return render_template(
        "search_cet.html"
    )


# ==========================================
# MHT CET COMPARE
# ==========================================

@app.route("/compare_cet")
def compare_cet():

    return render_template(
        "compare_cet.html"
    )


# ==========================================
# DSE MAIN PAGE
# ==========================================

@app.route("/dse")
def dse():

    return render_template(
        "dse.html"
    )


# ==========================================
# DSE PREDICTOR
# ==========================================

@app.route("/dse_predictor")
def dse_predictor():

    return render_template(
        "dse_predictor.html"
    )


# ==========================================
# DSE SEARCH COLLEGE
# ==========================================

@app.route("/search_dse")
def search_dse():

    return render_template(
        "search_dse.html"
    )


# ==========================================
# DSE COMPARE
# ==========================================

@app.route("/compare_dse")
def compare_dse():

    return render_template(
        "compare_dse.html"
    )

# ==========================================
# DSE Result
# ==========================================

@app.route("/dse_result")
def dse_result():

    return render_template(
        "dse_result.html"
    )

# ==========================================
# MHT CET Result
# ==========================================

@app.route("/mhtcet_result")
def mhtcet_result():

    return render_template(
        "mhtcet_result.html"
    )



# ==========================================
# NORMALIZE COLLEGE CODE
# ==========================================

def normalize_college_code(code):

    return str(
        code
    ).strip().zfill(5)


# ==========================================
# BUILD UNIQUE COLLEGE LIST
# ==========================================

def build_unique_college_list(
    college_data
):

    colleges = {}


    for record in college_data:

        code = normalize_college_code(

            record.get(
                "college_code",
                ""
            )

        )


        if not code:

            continue


        if code not in colleges:

            colleges[code] = {

                "college_code":
                    code,

                "college_name":
                    record.get(
                        "college_name",
                        ""
                    ),

                "district":
                    record.get(
                        "district",
                        ""
                    ),

                "region":
                    record.get(
                        "region",
                        ""
                    ),

                "college_type":
                    record.get(
                        "college_type",
                        ""
                    )

            }


    return list(
        colleges.values()
    )


# ==========================================
# PREPARE UNIQUE COLLEGE LISTS
# ==========================================

dse_compare_college_list = (
    build_unique_college_list(
        dse_colleges
    )
)


mhtcet_compare_college_list = (
    build_unique_college_list(
        mhtcet_colleges
    )
)


print(
    "DSE Compare Colleges :",
    len(
        dse_compare_college_list
    )
)


print(
    "MHT CET Compare Colleges :",
    len(
        mhtcet_compare_college_list
    )
)


# ==========================================
# SEARCH COLLEGES
# ==========================================

def search_colleges(
    college_list,
    search_text
):

    search_text = str(
        search_text
    ).strip().lower()


    if len(search_text) < 2:

        return []


    starts_with = []

    contains = []


    for college in college_list:

        college_name = str(

            college.get(
                "college_name",
                ""
            )

        ).strip().lower()


        college_code = str(

            college.get(
                "college_code",
                ""
            )

        ).strip().lower()


        # College Name Starts With Search

        if college_name.startswith(
            search_text
        ):

            starts_with.append(
                college
            )


        # Code Starts With Search

        elif college_code.startswith(
            search_text
        ):

            starts_with.append(
                college
            )


        # College Name Contains Search

        elif search_text in college_name:

            contains.append(
                college
            )


    result = (
        starts_with +
        contains
    )


    return result[:20]


# ==========================================
# DSE COLLEGE SEARCH API
# ==========================================

@app.route(
    "/dse_compare_colleges"
)
def dse_compare_colleges():

    locked = require_access()

    if locked:
        return locked

    search_text = request.args.get(
        "q",
        ""
    )


    result = search_colleges(

        dse_compare_college_list,

        search_text

    )


    return jsonify(
        result
    )


# ==========================================
# MHT CET COLLEGE SEARCH API
# ==========================================

@app.route(
    "/mhtcet_compare_colleges"
)
def mhtcet_compare_colleges():

    locked = require_access()

    if locked:
        return locked

    search_text = request.args.get(
        "q",
        ""
    )


    result = search_colleges(

        mhtcet_compare_college_list,

        search_text

    )


    return jsonify(
        result
    )


# ==========================================
# SAFE FLOAT
# ==========================================

def safe_float(value):

    try:

        return float(
            value
        )

    except (
        TypeError,
        ValueError
    ):

        return None


# ==========================================
# BUILD COMPARE DATA
# ==========================================

def build_compare_data(
    college_data,
    selected_codes
):

    # ======================================
    # NORMALIZE SELECTED CODES
    # ======================================

    selected_codes = [

        normalize_college_code(
            code
        )

        for code in selected_codes

        if code

    ]


    # Maximum 3 Colleges

    selected_codes = (
        selected_codes[:3]
    )


    # ======================================
    # RESULT STRUCTURE
    # ======================================

    colleges = {}


    for code in selected_codes:

        colleges[code] = {

            "college_code":
                code,

            "college_name":
                "",

            "district":
                "",

            "region":
                "",

            "college_type":
                "",

            "branches":
                {}

        }


    # ======================================
    # READ RECORDS
    # ======================================

    for record in college_data:

        code = normalize_college_code(

            record.get(
                "college_code",
                ""
            )

        )


        if code not in colleges:

            continue


        college = colleges[code]


        # ==================================
        # BASIC COLLEGE DETAILS
        # ==================================

        if not college[
            "college_name"
        ]:

            college[
                "college_name"
            ] = record.get(
                "college_name",
                ""
            )


        if not college[
            "district"
        ]:

            college[
                "district"
            ] = record.get(
                "district",
                ""
            )


        if not college[
            "region"
        ]:

            college[
                "region"
            ] = record.get(
                "region",
                ""
            )


        if not college[
            "college_type"
        ]:

            college[
                "college_type"
            ] = record.get(
                "college_type",
                ""
            )


        # ==================================
        # BRANCH
        # ==================================

        branch = str(

            record.get(
                "branch",
                ""
            )

        ).strip()


        if not branch:

            continue


        if branch not in college[
            "branches"
        ]:

            college[
                "branches"
            ][branch] = {}


        # ==================================
        # CATEGORY
        # ==================================

        category = str(

            record.get(
                "category",
                ""
            )

        ).strip()


        if not category:

            continue


        # ==================================
        # CUTOFF
        # ==================================

        cutoff = safe_float(

            record.get(
                "cutoff"
            )

        )


        if cutoff is None:

            continue


        # ==================================
        # DUPLICATE CATEGORY HANDLING
        # ==================================

        old_cutoff = (

            college[
                "branches"
            ][branch].get(
                category
            )

        )


        if old_cutoff is None:

            college[
                "branches"
            ][branch][category] = (
                cutoff
            )


        else:

            # Keep highest cutoff

            college[
                "branches"
            ][branch][category] = max(

                old_cutoff,

                cutoff

            )


    # ======================================
    # KEEP USER SELECTION ORDER
    # ======================================

    result = []


    for code in selected_codes:

        college = colleges.get(
            code
        )


        if not college:

            continue


        if not college[
            "college_name"
        ]:

            continue


        result.append(
            college
        )


    return result


# ==========================================
# DSE COMPARE DATA API
# ==========================================

@app.route(
    "/dse_compare_data",
    methods=["POST"]
)
def dse_compare_data():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json() or {}


    college_codes = data.get(
        "college_codes",
        []
    )


    if not isinstance(
        college_codes,
        list
    ):

        return jsonify({

            "error":
                "college_codes must be a list"

        }), 400


    if len(
        college_codes
    ) < 2:

        return jsonify({

            "error":
                "Select minimum 2 colleges"

        }), 400


    if len(
        college_codes
    ) > 3:

        return jsonify({

            "error":
                "Maximum 3 colleges allowed"

        }), 400


    result = build_compare_data(

        dse_colleges,

        college_codes

    )


    return jsonify(
        result
    )


# ==========================================
# MHT CET COMPARE DATA API
# ==========================================

@app.route(
    "/mhtcet_compare_data",
    methods=["POST"]
)
def mhtcet_compare_data():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json() or {}


    college_codes = data.get(
        "college_codes",
        []
    )


    if not isinstance(
        college_codes,
        list
    ):

        return jsonify({

            "error":
                "college_codes must be a list"

        }), 400


    if len(
        college_codes
    ) < 2:

        return jsonify({

            "error":
                "Select minimum 2 colleges"

        }), 400


    if len(
        college_codes
    ) > 3:

        return jsonify({

            "error":
                "Maximum 3 colleges allowed"

        }), 400


    result = build_compare_data(

        mhtcet_colleges,

        college_codes

    )


    return jsonify(
        result
    )
# ==========================================
# DSE Dropdown API
# ==========================================

# ==========================================
# DSE DROPDOWN API
# ==========================================

@app.route("/dropdowns")
def dropdowns():

    try:

        categories = sorted(set(
            str(c.get("category", "")).strip()
            for c in dse_colleges
            if str(c.get("category", "")).strip()
        ))

        branches = sorted(set(
            str(c.get("branch", "")).strip()
            for c in dse_colleges
            if str(c.get("branch", "")).strip()
        ))

        regions = sorted(set(
            str(c.get("region", "")).strip()
            for c in dse_colleges
            if str(c.get("region", "")).strip()
        ))

        college_types = sorted(set(
            str(c.get("college_type", "")).strip()
            for c in dse_colleges
            if str(c.get("college_type", "")).strip()
        ))

        return jsonify({

            "categories": categories,
            "branches": branches,
            "regions": regions,
            "college_types": college_types

        })

    except Exception as error:

        print(
            "DSE DROPDOWN ERROR:",
            repr(error)
        )

        return jsonify({

            "error":
                "Unable to load DSE dropdowns."

        }), 500




# ==========================================
# DSE District API
# ==========================================

@app.route("/districts", methods=["POST"])
def districts():

    data = request.get_json()

    region = data.get("region", "ALL")

    if region == "ALL":

        district = sorted(set(

            c["district"]

            for c in dse_colleges

            if c["district"]

        ))

    else:

        district = sorted(set(

            c["district"]

            for c in dse_colleges

            if c["region"] == region

        ))

    return jsonify(district)


# ==========================================
# MHT CET Dropdown API
# ==========================================

@app.route("/mhtcet_dropdowns")
def mhtcet_dropdowns():

    try:

        categories = sorted(set(
            str(c.get("category", "")).strip()
            for c in mhtcet_colleges
            if str(c.get("category", "")).strip()
        ))

        branches = sorted(set(
            str(c.get("branch", "")).strip()
            for c in mhtcet_colleges
            if str(c.get("branch", "")).strip()
        ))

        regions = sorted(set(
            str(c.get("region", "")).strip()
            for c in mhtcet_colleges
            if str(c.get("region", "")).strip()
        ))

        districts = sorted(set(
            str(c.get("district", "")).strip()
            for c in mhtcet_colleges
            if str(c.get("district", "")).strip()
        ))

        college_types = sorted(set(
            str(c.get("college_type", "")).strip()
            for c in mhtcet_colleges
            if str(c.get("college_type", "")).strip()
        ))

        return jsonify({

            "categories": categories,
            "branches": branches,
            "regions": regions,
            "districts": districts,
            "college_types": college_types

        })

    except Exception as error:

        print(
            "MHT CET DROPDOWN ERROR:",
            repr(error)
        )

        return jsonify({

            "error":
                "Unable to load MHT CET dropdowns."

        }), 500

# ==========================================
# MHT CET District API
# ==========================================

@app.route("/mhtcet_districts", methods=["POST"])
def mhtcet_districts():

    data = request.get_json()

    region = data.get("region", "ALL")

    if region == "ALL":

        district = sorted(set(

            c["district"]

            for c in mhtcet_colleges

            if c["district"]

        ))

    else:

        district = sorted(set(

            c["district"]

            for c in mhtcet_colleges

            if c["region"] == region

        ))

    return jsonify(district)
# ==========================================
# DSE Predictor API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json(silent=True) or {}

    percentage = safe_float(
        data.get("percentage")
    )

    if (
        percentage is None
        or percentage < 0
        or percentage > 100
    ):

        return jsonify({
            "error": "Enter a valid percentage from 0 to 100."
        }), 400

    category = data.get("category", "ALL")
    branch = data.get("branch", "ALL")
    region = data.get("region", "ALL")
    district = data.get("district", "ALL")
    college_type = data.get("college_type", "ALL")

    result = []

    for c in dse_colleges:

        if percentage < c["cutoff"]:
            continue

        if category != "ALL" and c["category"] != category:
            continue

        if branch != "ALL" and branch.lower() not in c["branch"].lower():
            continue

        if region != "ALL" and region.lower() != c["region"].lower():
            continue

        if district != "ALL" and district.lower() != c["district"].lower():
            continue

        if college_type != "ALL" and college_type.lower() not in c["college_type"].lower():
            continue

        result.append(c)

    result.sort(
        key=lambda x: x["cutoff"],
        reverse=True
    )

    return jsonify(result)


# ==========================================
# MHT CET Predictor API
# ==========================================

@app.route("/mhtcet_predict", methods=["POST"])
def mhtcet_predict():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json(silent=True) or {}

    percentile = safe_float(
        data.get("percentile")
    )

    if (
        percentile is None
        or percentile < 0
        or percentile > 100
    ):

        return jsonify({
            "error": "Enter a valid percentile from 0 to 100."
        }), 400

    categories = data.get("categories", [])
    branches = data.get("branches", [])
    regions = data.get("regions", [])
    districts = data.get("districts", [])
    college_types = data.get("college_types", [])

    result = []
    
    for c in mhtcet_colleges:

        # Percentile
        if percentile < c["cutoff"]:
            continue

        # Category
        if categories and c["category"] not in categories:
            continue

        # Branch
        if branches and c["branch"] not in branches:
            continue

        # Region
        if regions and c["region"] not in regions:
            continue

        # District
        if districts and c["district"] not in districts:
            continue

        # College Type
        if college_types and c["college_type"] not in college_types:
            continue

        result.append(c)

    result.sort(
        key=lambda x: x["cutoff"],
        reverse=True
    )

    return jsonify(result)
# ==========================================
# MHT CET SEARCH COLLEGE API
# ==========================================

@app.route(
    "/search_cet_colleges",
    methods=["GET"]
)
def search_cet_colleges():

    locked = require_access()

    if locked:
        return locked

    query = (
        request.args
        .get("q", "")
        .strip()
        .lower()
    )

    # Minimum 2 characters
    if len(query) < 2:

        return jsonify([])


    colleges = {}


    for c in mhtcet_colleges:

        college_code = str(
            c.get("college_code", "")
        ).strip()

        college_name = str(
            c.get("college_name", "")
        ).strip()

        district = str(
            c.get("district", "")
        ).strip()

        region = str(
            c.get("region", "")
        ).strip()

        college_type = str(
            c.get("college_type", "")
        ).strip()


        # Search college code or name
        if (
            query not in college_code.lower()

            and

            query not in college_name.lower()
        ):

            continue


        # Unique college
        if college_code not in colleges:

            colleges[college_code] = {

                "college_code":
                    college_code,

                "college_name":
                    college_name,

                "district":
                    district,

                "region":
                    region,

                "college_type":
                    college_type

            }


    result = list(
        colleges.values()
    )


    # Sort
    result.sort(

        key=lambda x: (

            0
            if query in
            x["college_code"].lower()
            else 1,

            0
            if x["college_name"]
            .lower()
            .startswith(query)
            else 1,

            x["college_name"].lower()

        )

    )


    # Maximum 30 search results
    return jsonify(
        result[:30]
    )


# ==========================================
# MHT CET COLLEGE FULL DETAILS API
# ==========================================

@app.route(
    "/search_cet_data",
    methods=["POST"]
)
def search_cet_data():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json(
        silent=True
    ) or {}


    college_code = str(

        data.get(
            "college_code",
            ""
        )

    ).strip()


    if not college_code:

        return jsonify({

            "error":
                "College code is required."

        }), 400


    records = []


    for c in mhtcet_colleges:

        if str(
            c.get(
                "college_code",
                ""
            )
        ).strip() == college_code:

            records.append(c)


    if not records:

        return jsonify({

            "error":
                "College not found."

        }), 404


    # ======================================
    # BASIC COLLEGE DETAILS
    # ======================================

    first = records[0]


    result = {

        "college_code":
            str(
                first.get(
                    "college_code",
                    ""
                )
            ),

        "college_name":
            first.get(
                "college_name",
                ""
            ),

        "district":
            first.get(
                "district",
                ""
            ),

        "region":
            first.get(
                "region",
                ""
            ),

        "college_type":
            first.get(
                "college_type",
                ""
            ),

        "branches": {}

    }


    # ======================================
    # BRANCH + CATEGORY CUTOFF
    # ======================================

    for record in records:

        branch = str(

            record.get(
                "branch",
                ""
            )

        ).strip()


        category = str(

            record.get(
                "category",
                ""
            )

        ).strip()


        cutoff = record.get(
            "cutoff"
        )


        if not branch:

            continue


        if not category:

            continue


        # Create branch
        if branch not in result["branches"]:

            result["branches"][branch] = {}


        # ==================================
        # SAME CATEGORY DUPLICATE HANDLING
        # ==================================

        old_cutoff = (
            result["branches"]
            [branch]
            .get(category)
        )


        if old_cutoff is None:

            result["branches"][
                branch
            ][category] = cutoff


        else:

            try:

                old_value = float(
                    old_cutoff
                )

                new_value = float(
                    cutoff
                )


                # Keep highest cutoff
                if new_value > old_value:

                    result["branches"][
                        branch
                    ][category] = cutoff


            except (
                TypeError,
                ValueError
            ):

                pass


    return jsonify(result)


# ==========================================
# DSE SEARCH COLLEGE API
# ==========================================

@app.route(
    "/search_dse_colleges",
    methods=["GET"]
)
def search_dse_colleges():

    locked = require_access()

    if locked:
        return locked

    query = (
        request.args
        .get("q", "")
        .strip()
        .lower()
    )


    if len(query) < 2:

        return jsonify([])


    colleges = {}


    for c in dse_colleges:

        college_code = str(
            c.get("college_code", "")
        ).strip()

        college_name = str(
            c.get("college_name", "")
        ).strip()

        district = str(
            c.get("district", "")
        ).strip()

        region = str(
            c.get("region", "")
        ).strip()

        college_type = str(
            c.get("college_type", "")
        ).strip()


        if (
            query not in college_code.lower()

            and

            query not in college_name.lower()
        ):

            continue


        if college_code not in colleges:

            colleges[college_code] = {

                "college_code":
                    college_code,

                "college_name":
                    college_name,

                "district":
                    district,

                "region":
                    region,

                "college_type":
                    college_type

            }


    result = list(
        colleges.values()
    )


    result.sort(

        key=lambda x: (

            0
            if query in
            x["college_code"].lower()
            else 1,

            0
            if x["college_name"]
            .lower()
            .startswith(query)
            else 1,

            x["college_name"].lower()

        )

    )


    return jsonify(
        result[:30]
    )


# ==========================================
# DSE COLLEGE FULL DETAILS API
# ==========================================

@app.route(
    "/search_dse_data",
    methods=["POST"]
)
def search_dse_data():

    locked = require_access()

    if locked:
        return locked

    data = request.get_json(
        silent=True
    ) or {}


    college_code = str(

        data.get(
            "college_code",
            ""
        )

    ).strip()


    if not college_code:

        return jsonify({

            "error":
                "College code is required."

        }), 400


    records = []


    for c in dse_colleges:

        if str(
            c.get(
                "college_code",
                ""
            )
        ).strip() == college_code:

            records.append(c)


    if not records:

        return jsonify({

            "error":
                "College not found."

        }), 404


    # ======================================
    # BASIC COLLEGE DETAILS
    # ======================================

    first = records[0]


    result = {

        "college_code":
            str(
                first.get(
                    "college_code",
                    ""
                )
            ),

        "college_name":
            first.get(
                "college_name",
                ""
            ),

        "district":
            first.get(
                "district",
                ""
            ),

        "region":
            first.get(
                "region",
                ""
            ),

        "college_type":
            first.get(
                "college_type",
                ""
            ),

        "branches": {}

    }


    # ======================================
    # BRANCH + CATEGORY CUTOFF
    # ======================================

    for record in records:

        branch = str(

            record.get(
                "branch",
                ""
            )

        ).strip()


        category = str(

            record.get(
                "category",
                ""
            )

        ).strip()


        cutoff = record.get(
            "cutoff"
        )


        if not branch:

            continue


        if not category:

            continue


        if branch not in result["branches"]:

            result["branches"][branch] = {}


        old_cutoff = (
            result["branches"]
            [branch]
            .get(category)
        )


        if old_cutoff is None:

            result["branches"][
                branch
            ][category] = cutoff


        else:

            try:

                old_value = float(
                    old_cutoff
                )

                new_value = float(
                    cutoff
                )


                # Keep highest cutoff
                if new_value > old_value:

                    result["branches"][
                        branch
                    ][category] = cutoff


            except (
                TypeError,
                ValueError
            ):

                pass


    return jsonify(result)

# ==========================================
# Run Flask
# ==========================================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )