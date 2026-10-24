import json

# ======================================================
# FILES
# ======================================================

INPUT_FILE = "part1_mhtcet_colleges.json"
MASTER_FILE = "college_master.json"
OUTPUT_FILE = "mhtcet_colleges.json"


# ======================================================
# LOAD JSON FILES
# ======================================================

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    records = json.load(f)

with open(MASTER_FILE, "r", encoding="utf-8") as f:
    master = json.load(f)


print("=" * 70)
print("INPUT RECORDS  :", len(records))
print("MASTER COLLEGES:", len(master))
print("=" * 70)


# ======================================================
# NORMALIZE MASTER
# ======================================================

normalized_master = {}

for code, data in master.items():

    normalized_code = str(code).strip().zfill(5)

    normalized_master[normalized_code] = data


print("Normalized Master Colleges :", len(normalized_master))


# ======================================================
# UPDATE RECORDS
# ======================================================

updated_records = []

matched = 0
missing = 0

missing_codes = set()


for record in records:

    # --------------------------------------------------
    # COPY RECORD
    # --------------------------------------------------

    new_record = record.copy()


    # --------------------------------------------------
    # REMOVE SEAT TYPE
    # --------------------------------------------------

    new_record.pop("seat_type", None)


    # --------------------------------------------------
    # COLLEGE CODE
    # --------------------------------------------------

    college_code = str(
        new_record.get("college_code", "")
    ).strip().zfill(5)


    new_record["college_code"] = college_code


    # --------------------------------------------------
    # DISTRICT / REGION LOOKUP
    # --------------------------------------------------

    if college_code in normalized_master:

        master_data = normalized_master[college_code]

        district = master_data.get(
            "district",
            ""
        )

        region = master_data.get(
            "region",
            ""
        )

        matched += 1

    else:

        district = ""
        region = ""

        missing += 1

        missing_codes.add(college_code)


    # --------------------------------------------------
    # CREATE FINAL RECORD
    # --------------------------------------------------

    final_record = {

        "college_code":
            new_record.get("college_code", ""),

        "college_name":
            new_record.get("college_name", ""),

        "district":
            district,

        "region":
            region,

        "college_type":
            new_record.get("college_type", ""),

        "choice_code":
            new_record.get("choice_code", ""),

        "branch":
            new_record.get("branch", ""),

        "stage":
            new_record.get("stage", ""),

        "category":
            new_record.get("category", ""),

        "merit_rank":
            new_record.get("merit_rank"),

        "cutoff":
            new_record.get("cutoff")

    }


    updated_records.append(final_record)


# ======================================================
# SAVE JSON
# ======================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        updated_records,
        f,
        ensure_ascii=False,
        indent=2
    )


# ======================================================
# REPORT
# ======================================================

print()
print("=" * 70)
print("UPDATE REPORT")
print("=" * 70)

print("Total Records :", len(records))

print("Matched       :", matched)

print("Missing       :", missing)

print(
    "Missing Colleges :",
    len(missing_codes)
)


# ======================================================
# MISSING COLLEGE CODES
# ======================================================

if missing_codes:

    print()
    print("=" * 70)
    print("MISSING COLLEGE CODES")
    print("=" * 70)

    for code in sorted(missing_codes):

        print(code)


# ======================================================
# VALIDATION
# ======================================================

empty_district = 0
empty_region = 0
seat_type_found = 0


for record in updated_records:

    if not record["district"]:
        empty_district += 1

    if not record["region"]:
        empty_region += 1

    if "seat_type" in record:
        seat_type_found += 1


print()
print("=" * 70)
print("VALIDATION")
print("=" * 70)

print(
    "Empty District :",
    empty_district
)

print(
    "Empty Region   :",
    empty_region
)

print(
    "Seat Type Found:",
    seat_type_found
)


# ======================================================
# FINAL
# ======================================================

print()
print("=" * 70)

print(
    "OUTPUT FILE :",
    OUTPUT_FILE
)

print("=" * 70)

print("JSON UPDATE COMPLETED")