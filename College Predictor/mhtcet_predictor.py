import json

# ---------------------------------------
# Load MHT CET JSON
# ---------------------------------------

with open("mhtcet_colleges.json", "r", encoding="utf-8") as f:
    colleges = json.load(f)

print("Total Records :", len(colleges))

# ---------------------------------------
# User Input
# ---------------------------------------

percentile = float(input("Enter MHT CET Percentile : "))

category = input(
    "Category (ALL/GOPENH/GOPENO/GOPENS/TFWS/EWS/...): "
).strip().upper()

branch = input(
    "Branch (ALL/Computer/IT/AIML/AI&DS/ENTC/Mechanical/...): "
).strip().lower()

college_type = input(
    "College Type (ALL/Government/Private/Government Autonomous/Private Autonomous/Autonomous): "
).strip().lower()

district = input(
    "District (ALL/Pune/Mumbai/Nashik/Nagpur/...): "
).strip().lower()

region = input(
    "Region (ALL/Pune/Mumbai/Nagpur/Amravati/...): "
).strip().lower()

result = []

# ---------------------------------------
# Filter Colleges
# ---------------------------------------

for c in colleges:

    # Category
    if category != "ALL":
        if c["category"] != category:
            continue

    # Percentile
    if percentile < c["cutoff"]:
        continue

    # Branch
    if branch != "all":
        if branch not in c["branch"].lower():
            continue

    # College Type
    if college_type != "all":
        if college_type not in c["college_type"].lower():
            continue

    # District
    if district != "all":
        if district != c["district"].lower():
            continue

    # Region
    if region != "all":
        if region != c["region"].lower():
            continue

    result.append(c)

# ---------------------------------------
# Sort
# ---------------------------------------

result = sorted(
    result,
    key=lambda x: x["cutoff"],
    reverse=True
)

# ---------------------------------------
# Result
# ---------------------------------------

print("\nEligible Colleges :", len(result))

for c in result:

    print("-" * 70)
    print("College      :", c["college_name"])
    print("Branch       :", c["branch"])
    print("Category     :", c["category"])
    print("Percentile   :", c["cutoff"])
    print("District     :", c["district"])
    print("Region       :", c["region"])
    print("College Type :", c["college_type"])
    print("Portal Link  :", c["portal_link"])