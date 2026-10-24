import json

with open("colleges.json", "r", encoding="utf-8") as f:
    colleges = json.load(f)

print("Total Records :", len(colleges))

percentage = float(input("Enter Percentage : "))

category = input(
    "Category (ALL/GOPEN/GSC/GOBC/GST/...): "
).strip().upper()

branch = input(
    "Branch (ALL/Computer/IT/Artificial Intelligence and Machine Learning/ENTC/AI/Mechanical): "
).strip().lower()

college_type = input(
    "College Type (ALL/Government/Private/Government Autonomous/Private Autonomous/Autonomous): "
).strip().lower()

district = input(
    "District (ALL/Pune/Mumbai/Nashik/Amravati/...): "
).strip().lower()

result = []

for c in colleges:

    # Category Filter
    if category != "ALL":
        if c["category"] != category:
            continue

    # Percentage Filter
    if percentage < c["cutoff"]:
        continue

    # Branch Filter
    if branch != "all":
        if branch not in c["branch"].lower():
            continue

    # College Type Filter
    if college_type != "all":
        if college_type not in c["college_type"].lower():
            continue

    # District Filter
    if district != "all":
        if district != c["district"].lower():
            continue

    result.append(c)

# Sort by Cutoff
result = sorted(
    result,
    key=lambda x: x["cutoff"],
    reverse=True
)

print("\nEligible Colleges :", len(result))

for c in result:

    print("-" * 60)
    print("College      :", c["college_name"])
    print("Branch       :", c["branch"])
    print("Category     :", c["category"])
    print("Cutoff       :", c["cutoff"])
    print("District     :", c["district"])
    print("College Type :", c["college_type"])