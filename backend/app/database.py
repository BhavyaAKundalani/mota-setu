"""
MoTA SETU - SQLite Database Management
Self-contained, zero-cost, persistent storage for tribal scholarship applications,
audits, and PFMS DBT staging ledgers.
"""
import sqlite3
import os
import json
import hashlib
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mota_setu.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Applications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref_no TEXT UNIQUE NOT NULL,
        scholar_name TEXT NOT NULL,
        name_hindi TEXT,
        aadhaar_hash TEXT NOT NULL,
        caste_cert_no TEXT,
        tribe TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        issuing_authority TEXT NOT NULL,
        institution TEXT NOT NULL,
        course TEXT NOT NULL,
        scheme TEXT NOT NULL,
        annual_income INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        account_masked TEXT NOT NULL,
        ifsc TEXT NOT NULL,
        status TEXT NOT NULL,
        ai_recommendation TEXT NOT NULL,
        ai_confidence INTEGER DEFAULT 95,
        ai_readability INTEGER DEFAULT 89,
        ai_seal_detected INTEGER DEFAULT 96,
        discrepancy_details TEXT,
        cure_action_needed TEXT,
        cure_deadline TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)
    
    # Audit Trail Table (Section 65B IT Act Compliance)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER,
        ref_no TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
    """)
    
    # DBT Reconciliation Ledger Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dbt_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL,
        ref_no TEXT NOT NULL,
        scholar_name TEXT NOT NULL,
        scheme TEXT NOT NULL,
        aadhaar_hash TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        account_masked TEXT NOT NULL,
        ifsc TEXT NOT NULL,
        monthly_grant INTEGER NOT NULL,
        npci_status TEXT NOT NULL,
        error_code TEXT,
        ledger_hash TEXT NOT NULL,
        settlement_status TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
    """)
    
    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL,
        aadhaar_hash TEXT,
        employee_id TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Submitted Applications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submitted_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        ref_no TEXT UNIQUE NOT NULL,
        scholar_name TEXT NOT NULL,
        name_hindi TEXT,
        aadhaar_hash TEXT NOT NULL,
        caste_cert_no TEXT,
        tribe TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        issuing_authority TEXT NOT NULL,
        institution TEXT NOT NULL,
        course TEXT NOT NULL,
        scheme TEXT NOT NULL,
        annual_income INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        account_masked TEXT NOT NULL,
        ifsc TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # Consent Log Table (DPDPA)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consent_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        purpose TEXT NOT NULL,
        ip_address TEXT,
        timestamp TEXT NOT NULL
    );
    """)
    
    conn.commit()
    seed_initial_records(conn)
    conn.close()

def log_audit(conn, ref_no, actor, action, details, app_id=None):
    ts = datetime.now().isoformat()
    raw_str = f"{ref_no}|{actor}|{action}|{details}|{ts}"
    h = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()[:16]
    conn.execute("""
        INSERT INTO audit_trail (application_id, ref_no, actor, action, details, sha256_hash, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (app_id, ref_no, actor, action, details, h, ts))
    conn.commit()
    return h

def seed_initial_records(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM applications")
    if cursor.fetchone()["cnt"] > 0:
        return # Already seeded
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Seed 1: Mangal Soren (Phonetic Discrepancy - Soren vs Saren)
    cursor.execute("""
    INSERT INTO applications (
        ref_no, scholar_name, name_hindi, aadhaar_hash, caste_cert_no,
        tribe, district, state, issuing_authority, institution, course, scheme,
        annual_income, bank_name, account_masked, ifsc, status, ai_recommendation,
        ai_confidence, ai_readability, ai_seal_detected, discrepancy_details,
        cure_action_needed, cure_deadline, created_at, updated_at
    ) VALUES (
        'MOTA-2025-JH-88391', 'Mangal Soren', 'मंगल सोरेन', '•••• 9104', 'JH/ST/2021/892014',
        'Santhal', 'Ranchi', 'Jharkhand', 'Sub-Divisional Magistrate (SDM), Sadar Ranchi',
        'Central University of Jharkhand (CUJ)', 'Ph.D in Physics', 'NFST Fellowship',
        180000, 'State Bank of India', '•••• 4892', 'SBIN0000167',
        'DISCREPANCY_QUEUE', 'PERMISSIBLE_DIALECT_VARIANT',
        91, 89, 96,
        'Certificate records "Mangal Soren", Matriculation records "Mangal Saren". Rule 14(b) permissible tribal dialect variance.',
        'Apply Auto-Cure Exemption under Rule 14(b)', '2025-11-20', ?, ?
    )
    """, (now, now))
    
    app_id_1 = cursor.lastrowid
    log_audit(conn, 'MOTA-2025-JH-88391', 'NSP_CORE', 'Ingestion Push', 'Application synced from National Scholarship Portal', app_id_1)
    log_audit(conn, 'MOTA-2025-JH-88391', 'SETU_AI_ENGINE', 'Automated Verification', 'DigiLocker matched 100%. Phonetic variance detected (Rule 14b compliant)', app_id_1)
    
    # Seed 2: Anjali Kerketta (Defect Queue - Faded Stamp)
    cursor.execute("""
    INSERT INTO applications (
        ref_no, scholar_name, name_hindi, aadhaar_hash, caste_cert_no,
        tribe, district, state, issuing_authority, institution, course, scheme,
        annual_income, bank_name, account_masked, ifsc, status, ai_recommendation,
        ai_confidence, ai_readability, ai_seal_detected, discrepancy_details,
        cure_action_needed, cure_deadline, created_at, updated_at
    ) VALUES (
        'MOTA-2025-OD-10492', 'Anjali Kerketta', 'अंजलि केरकेट्टा', '•••• 4421', 'OD/ST/2022/44120',
        'Oraon', 'Sundargarh', 'Odisha', 'Executive Tahasildar, Sundargarh Sadar',
        'University of Leeds, UK', 'M.Sc Environmental Science', 'NOS Overseas',
        240000, 'Punjab National Bank', '•••• 8109', 'PUNB0014200',
        'DEFECT_RESOLUTION_PENDING', 'CLARIFICATION_REQUIRED',
        74, 42, 58,
        'Page 2 Tahasildar Revenue Stamp faded during upload. 42% legibility.',
        'Upload clear single-element photo of Tahasildar stamp', '2025-11-18', ?, ?
    )
    """, (now, now))
    
    app_id_2 = cursor.lastrowid
    log_audit(conn, 'MOTA-2025-OD-10492', 'NSP_CORE', 'Ingestion Push', 'NOS Application verified against UK ENIC and Leeds CAS', app_id_2)
    log_audit(conn, 'MOTA-2025-OD-10492', 'DESK_OFFICER_P_TRIPATHY', 'Clarification Flag', 'Dispatched SMS/WhatsApp 1-click photo re-upload link to scholar', app_id_2)
    
    # Seed 3: Birsa Munda (100% Pre-Approved)
    cursor.execute("""
    INSERT INTO applications (
        ref_no, scholar_name, name_hindi, aadhaar_hash, caste_cert_no,
        tribe, district, state, issuing_authority, institution, course, scheme,
        annual_income, bank_name, account_masked, ifsc, status, ai_recommendation,
        ai_confidence, ai_readability, ai_seal_detected, discrepancy_details,
        cure_action_needed, cure_deadline, created_at, updated_at
    ) VALUES (
        'MOTA-2025-MP-51204', 'Birsa Munda', 'बिरसा मुंडा', '•••• 6712', 'JH/ST/2021/89412',
        'Munda', 'Khunti', 'Jharkhand', 'Sub-Divisional Magistrate (SDM), Khunti',
        'Indian Institute of Technology (IIT) Delhi', 'Ph.D Tribal Ecology', 'NFST Fellowship',
        140000, 'Bank of Baroda', '•••• 2341', 'BARB0KJHUNT',
        'AI_PRE_APPROVED', 'READY_FOR_SANCTION',
        98, 94, 99,
        'All criteria cleared with 100% cryptographic authority match.',
        'None', NULL, ?, ?
    )
    """, (now, now))
    
    # Seed 4: Sunita Bodo (Bank Mandate Issue - NPCI Error 02)
    cursor.execute("""
    INSERT INTO applications (
        ref_no, scholar_name, name_hindi, aadhaar_hash, caste_cert_no,
        tribe, district, state, issuing_authority, institution, course, scheme,
        annual_income, bank_name, account_masked, ifsc, status, ai_recommendation,
        ai_confidence, ai_readability, ai_seal_detected, discrepancy_details,
        cure_action_needed, cure_deadline, created_at, updated_at
    ) VALUES (
        'MOTA-2025-CG-99120', 'Sunita Bodo', 'सुनीता बोडो', '•••• 1189', 'AS/ST/2023/11029',
        'Bodo', 'Kokrajhar', 'Assam', 'Circle Officer, Kokrajhar Sadar',
        'Gauhati University', 'M.Phil Folklore Studies', 'NFST Fellowship',
        95000, 'Assam Gramin Vikash Bank', '•••• 7712', 'AGVB0001099',
        'NEEDS_ATTENTION', 'BANK_MANDATE_INACTIVE',
        92, 91, 95,
        'NPCI Error 02: Inactive or Dormant Account detected during APBS pre-staging.',
        'Trigger Doorstep Dak Sevak e-KYC or switch to India Post Payments Bank', '2025-11-25', ?, ?
    )
    """, (now, now))
    
    # Seed 5: Ramesh Meena (Ready for batch)
    cursor.execute("""
    INSERT INTO applications (
        ref_no, scholar_name, name_hindi, aadhaar_hash, caste_cert_no,
        tribe, district, state, issuing_authority, institution, course, scheme,
        annual_income, bank_name, account_masked, ifsc, status, ai_recommendation,
        ai_confidence, ai_readability, ai_seal_detected, discrepancy_details,
        cure_action_needed, cure_deadline, created_at, updated_at
    ) VALUES (
        'MOTA-2025-RJ-77402', 'Ramesh Meena', 'रमेश मीणा', '•••• 5590', 'RJ/ST/2022/77104',
        'Meena', 'Udaipur', 'Rajasthan', 'Tehsildar, Girwa, Udaipur',
        'Mohanlal Sukhadia University', 'Ph.D Botany', 'NFST Fellowship',
        175000, 'Canara Bank', '•••• 9901', 'CNRB0002100',
        'AI_PRE_APPROVED', 'READY_FOR_SANCTION',
        96, 92, 97,
        'Clean statutory record. AISHE valid.',
        'None', NULL, ?, ?
    )
    """, (now, now))
    
    # Seed DBT Ledger Rows
    cursor.execute("""
    INSERT INTO dbt_ledger (batch_id, ref_no, scholar_name, scheme, aadhaar_hash, bank_name, account_masked, ifsc, monthly_grant, npci_status, error_code, ledger_hash, settlement_status, timestamp)
    VALUES 
    ('#MOTA-DBT-2025-11-04-09', 'MOTA-2025-JH-88391', 'Mangal Soren', 'NFST Fellowship', '•••• 9104', 'State Bank of India', '•••• 4892', 'SBIN0000167', 38800, 'Active / Seeded', NULL, '7f8a3b21c44e9901', 'Ready for Disbursal', ?),
    ('#MOTA-DBT-2025-11-04-09', 'MOTA-2025-OD-10492', 'Anjali Kerketta', 'NOS Overseas', '•••• 4421', 'Punjab National Bank', '•••• 8109', 'PUNB0014200', 34200, 'Active / Seeded', NULL, '9d12c440ea117721', 'Ready for Disbursal', ?),
    ('#MOTA-DBT-2025-11-04-09', 'MOTA-2025-MP-51204', 'Birsa Munda', 'NFST Fellowship', '•••• 6712', 'Bank of Baroda', '•••• 2341', 'BARB0KJHUNT', 38800, 'Active / Seeded', NULL, '4e31881fb092441a', 'Ready for Disbursal', ?),
    ('#MOTA-DBT-2025-11-04-09', 'MOTA-2025-CG-99120', 'Sunita Bodo', 'NFST Fellowship', '•••• 1189', 'Assam Gramin Vikash Bank', '•••• 7712', 'AGVB0001099', 38800, 'Exception / Dormant', 'NPCI Err 02', '3a99fe12998811bc', 'Needs Attention', ?),
    ('#MOTA-DBT-2025-11-04-09', 'MOTA-2025-RJ-77402', 'Ramesh Meena', 'NFST Fellowship', '•••• 5590', 'Canara Bank', '•••• 9901', 'CNRB0002100', 38800, 'Active / Seeded', NULL, '1c8477bae1100234', 'Ready for Disbursal', ?)
    """, (now, now, now, now, now))
    
    # Seed Initial Users (Scholar & Officers)
    cursor.execute("SELECT COUNT(*) as u_cnt FROM users")
    if cursor.fetchone()["u_cnt"] == 0:
        import uuid
        salt_scholar = "salt_mangal_2025"
        pwd_scholar = hashlib.sha256(f"tribal@123{salt_scholar}".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (email, mobile, name, password_hash, salt, role, aadhaar_hash, employee_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'mangal.soren@cuj.ac.in', '9876543210', 'Mangal Soren',
            pwd_scholar, salt_scholar, 'SCHOLAR', '•••• 9104', None, now
        ))
        
        salt_officer = "salt_mukherjee_2025"
        pwd_officer = hashlib.sha256(f"officer@123{salt_officer}".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (email, mobile, name, password_hash, salt, role, aadhaar_hash, employee_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'r.mukherjee.tribal@gov.in', '9431109922', 'R. Mukherjee',
            pwd_officer, salt_officer, 'OFFICER_L2', None, 'MOTA-DESK-2025-081', now
        ))

        salt_sno = "salt_sno_2025"
        pwd_sno = hashlib.sha256(f"sno@123{salt_sno}".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (email, mobile, name, password_hash, salt, role, aadhaar_hash, employee_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'sno.jharkhand@nic.in', '9431109933', 'P. Tripathy',
            pwd_sno, salt_sno, 'SNO', None, 'SNO-JH-2025', now
        ))

    conn.commit()
    print("Database seeded with statutory sample records and authorized users successfully.")
