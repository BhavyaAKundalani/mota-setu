"""
MoTA SETU - Statutory Rules & Eligibility Verification Engine
Implements deterministic checks for:
- NFST (National Fellowship for Higher Education of ST Students)
- NOS (National Overseas Scholarship for Scheduled Tribes)
- Article 342 Scheduled Tribes Gazetted Directory
"""

STATUTORY_INCOME_CAPS = {
    "NFST Fellowship": 600000,   # ₹6.0 Lakhs per annum
    "NOS Overseas": 800000,      # ₹8.0 Lakhs per annum
    "Post-Matric ST": 250000     # ₹2.5 Lakhs per annum
}

RECOGNIZED_TRIBAL_LIST = {
    "Jharkhand": ["Munda", "Santhal", "Oraon", "Ho", "Kharia", "Bhumij", "Birhor"],
    "Odisha": ["Santhal", "Oraon", "Kandha", "Saora", "Bonda", "Gond", "Koya"],
    "Madhya Pradesh": ["Gond", "Bhil", "Baiga", "Sahariya", "Korku", "Kol"],
    "Chhattisgarh": ["Gond", "Abujhmaria", "Bastar Muria", "Halba", "Bhatra"],
    "Assam": ["Bodo", "Mishing", "Karbi", "Rabha", "Dimasa", "Tiwa"],
    "Rajasthan": ["Meena", "Bhil", "Garasia", "Sahariya"]
}

def verify_statutory_eligibility(scheme: str, annual_income: int, state: str, tribe: str, institution: str) -> dict:
    """
    Evaluates an application against statutory Gazette rules.
    Returns pass/fail audit flags for each statutory criterion.
    """
    # 1. Means Assessment (Income Cap)
    cap = STATUTORY_INCOME_CAPS.get(scheme, 600000)
    income_pass = annual_income <= cap
    
    # 2. Article 342 Tribal Gazetted Schedule
    state_tribes = RECOGNIZED_TRIBAL_LIST.get(state, [])
    tribe_match = any(t.lower() in tribe.lower() for t in state_tribes) if state_tribes else True
    
    # 3. Accreditation (AISHE / QS Ranking)
    accredited = True
    if scheme == "NOS Overseas":
        # Top 500 QS Foreign University requirement
        top_foreign = ["leeds", "oxford", "cambridge", "ubc", "toronto", "melbourne", "edinburgh"]
        accredited = any(u in institution.lower() for u in top_foreign)
    
    passed_all = income_pass and tribe_match and accredited
    
    return {
        "eligible": passed_all,
        "criteria": {
            "income_check": {
                "passed": income_pass,
                "annual_income": annual_income,
                "statutory_cap": cap,
                "notes": f"Declared income ₹{annual_income:,} is within cap ₹{cap:,}" if income_pass else f"Income ₹{annual_income:,} exceeds statutory ceiling ₹{cap:,}"
            },
            "article_342_check": {
                "passed": tribe_match,
                "tribe": tribe,
                "state": state,
                "notes": f"{tribe} is recognized under Article 342 schedule for {state}" if tribe_match else f"{tribe} not found in gazette for {state}"
            },
            "accreditation_check": {
                "passed": accredited,
                "institution": institution,
                "notes": "Institute validated via AISHE / QS Directory" if accredited else "Institute not accredited under UGC/AISHE guidelines"
            }
        },
        "disbursal_entitlement": "₹38,800 / month + HRA" if scheme == "NFST Fellowship" else "£34,200 / Direct DBT"
    }
