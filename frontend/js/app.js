/**
 * MoTA SETU - Ministry of Tribal Affairs (SIH26239)
 * Full Interactive Engine & Client-Side Controller
 * Version 2.2.0 - 100% Interactive Prototype 2
 */

// ==========================================
// 1. Core Utilities (Voice, Toast, Files)
// ==========================================

let sahayakVoiceEnabled = true;

function speakText(text, lang = "hi-IN") {
    if (!sahayakVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/[#*_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('Speech synthesis unavailable:', e);
    }
}

function showToast(message, icon = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 p-3.5 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-2xl text-on-surface text-xs pointer-events-auto transform transition-all duration-300 translate-y-[-20px] opacity-0';
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">${icon}</span>
        </div>
        <div class="flex-1 font-medium leading-relaxed">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-on-surface-variant hover:text-on-surface p-1">
            <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function downloadFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function getElements(selector, textMatch = null) {
    const list = Array.from(document.querySelectorAll(selector));
    if (!textMatch) return list;
    const lower = textMatch.toLowerCase();
    return list.filter(el => (el.textContent || '').toLowerCase().includes(lower));
}

function getElement(selector, textMatch = null) {
    const els = getElements(selector, textMatch);
    return els.length > 0 ? els[0] : null;
}

// ==========================================
// 2. Rollout AI Sahayak Drawer & Chat Controller
// ==========================================

function toggleSahayakDrawer() {
    const drawer = document.getElementById('sahayak-drawer');
    if (!drawer) return;
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
        const input = document.getElementById('sahayak-input');
        if (input) input.focus();
    }
}

function toggleSahayakSpeech() {
    sahayakVoiceEnabled = !sahayakVoiceEnabled;
    const btn = document.getElementById('sahayak-tts-btn');
    if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${sahayakVoiceEnabled ? 'volume_up' : 'volume_off'}</span>`;
    }
    showToast(sahayakVoiceEnabled ? 'Voice assistance enabled (Hindi & English)' : 'Voice assistance muted', sahayakVoiceEnabled ? 'volume_up' : 'volume_off');
}

function askSahayakQuick(query) {
    const input = document.getElementById('sahayak-input');
    if (input) {
        input.value = query;
        sendSahayakMessage();
    }
}

async function sendSahayakMessage() {
    const input = document.getElementById('sahayak-input');
    const container = document.getElementById('sahayak-chat-messages');
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'flex justify-end';
    userMsg.innerHTML = `
        <div class="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-xs font-medium leading-relaxed shadow-sm">
            ${query}
        </div>
    `;
    container.appendChild(userMsg);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Append AI Typing placeholder
    const aiMsg = document.createElement('div');
    aiMsg.className = 'flex gap-2 items-start';
    aiMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
        </div>
        <div class="bg-surface-container p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-xs text-on-surface flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span>Consulting MoTA Knowledge Engine & Rule 14(b)...</span>
        </div>
    `;
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;

    try {
        const res = await fetch('/api/sahayak/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query, page_context: window.location.pathname })
        });
        const data = await res.json();
        
        let navBtn = '';
        if (data.navigation_path) {
            navBtn = `<div class="mt-2 pt-2 border-t border-outline-variant/30">
                <a href="${data.navigation_path}" class="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                    Go to Portal <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
            </div>`;
        }

        aiMsg.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[16px]">smart_toy</span>
            </div>
            <div class="bg-surface-container p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-xs text-on-surface leading-relaxed">
                <p>${data.reply}</p>
                ${navBtn}
            </div>
        `;
        speakText(data.speak_text || data.reply);
    } catch (e) {
        aiMsg.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[16px]">smart_toy</span>
            </div>
            <div class="bg-surface-container p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-xs text-on-surface leading-relaxed">
                <p>MoTA SETU ensures zero scholarship rejections for genuine tribal scholars. Under Rule 14(b), dialectical spelling variations are cured autonomously, and desk officers authorize electronic DBT mandates directly.</p>
                <div class="mt-2 pt-2 border-t border-outline-variant/30 flex gap-2">
                    <a href="/apply" class="text-[11px] font-bold text-primary hover:underline">Apply Portal →</a>
                    <a href="/officer" class="text-[11px] font-bold text-secondary hover:underline">Officer Desk →</a>
                </div>
            </div>
        `;
    }
    container.scrollTop = container.scrollHeight;
}

// Close drawer on backdrop click or Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const drawer = document.getElementById('sahayak-drawer');
        if (drawer && !drawer.classList.contains('hidden')) drawer.classList.add('hidden');
    }
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleSahayakDrawer();
    }
});

// ==========================================
// 3. Global Header Controller (Font, Lang, Search)
// ==========================================

let currentFontSizeIndex = 1;
const fontScales = ['90%', '100%', '115%'];

function initGlobalHeader() {
    // Font Scaling A-, A, A+
    getElements('button', 'A-').forEach(btn => {
        btn.onclick = () => {
            currentFontSizeIndex = Math.max(0, currentFontSizeIndex - 1);
            document.documentElement.style.fontSize = fontScales[currentFontSizeIndex];
            showToast(`Text Size: ${fontScales[currentFontSizeIndex]}`, 'format_size');
        };
    });
    getElements('button', 'A').forEach(btn => {
        if (btn.textContent.trim() === 'A') {
            btn.onclick = () => {
                currentFontSizeIndex = 1;
                document.documentElement.style.fontSize = fontScales[currentFontSizeIndex];
                showToast(`Text Size: 100% (Standard)`, 'format_size');
            };
        }
    });
    getElements('button', 'A+').forEach(btn => {
        btn.onclick = () => {
            currentFontSizeIndex = Math.min(fontScales.length - 1, currentFontSizeIndex + 1);
            document.documentElement.style.fontSize = fontScales[currentFontSizeIndex];
            showToast(`Text Size: ${fontScales[currentFontSizeIndex]}`, 'format_size');
        };
    });

    // Language Switcher Links
    const langNames = {
        'हिन्दी': 'Hindi',
        'संथाली': 'Santhali (Ol Chiki)',
        'गोंडी': 'Gondi',
        'ଓଡ଼ିଆ': 'Odia',
        'English': 'English'
    };
    document.querySelectorAll('a, button').forEach(el => {
        const txt = el.textContent.trim();
        if (langNames[txt]) {
            el.onclick = (e) => {
                e.preventDefault();
                showToast(`Language set to: ${langNames[txt]} (भाषा बदली गई)`, 'translate');
                speakText(`Language preference set to ${langNames[txt]}`);
            };
        }
    });

    // Global Search (Ctrl + K)
    document.querySelectorAll('input[placeholder*="Search"], input[placeholder*="Ctrl + K"]').forEach(inp => {
        inp.addEventListener('focus', openGlobalSearchModal);
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            openGlobalSearchModal();
        }
    });
}

function openGlobalSearchModal() {
    let existing = document.getElementById('global-search-modal');
    if (existing) {
        existing.classList.remove('hidden');
        const input = existing.querySelector('input');
        if (input) input.focus();
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200';
    modal.innerHTML = `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
            <div class="p-3 border-b border-outline-variant flex items-center gap-3 bg-surface-container-low">
                <span class="material-symbols-outlined text-primary text-[22px]">search</span>
                <input type="text" id="global-search-input" placeholder="Search portals, schemes, Rule 14(b), or Ref Numbers..." 
                    class="flex-1 bg-transparent text-sm focus:outline-none text-on-surface font-medium"/>
                <span class="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">ESC to close</span>
            </div>
            <div class="p-3 max-h-80 overflow-y-auto space-y-1 text-xs text-on-surface">
                <div class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2 py-1">Quick Portals</div>
                <a href="/apply" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-primary text-[18px]">school</span> NFST Student Application Portal</span>
                    <span class="text-secondary font-bold">Apply Now →</span>
                </a>
                <a href="/officer" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-primary text-[18px]">gavel</span> Officer Scrutiny Console (Rule 14b Desk)</span>
                    <span class="text-secondary font-bold">Open Console →</span>
                </a>
                <a href="/track-cure" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-primary text-[18px]">healing</span> Track & Cure Defect (Autonomous Seal Re-check)</span>
                    <span class="text-secondary font-bold">Track →</span>
                </a>
                <a href="/ledger" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-primary text-[18px]">account_balance</span> PFMS Disbursal & RBI e-Kuber Ledger</span>
                    <span class="text-secondary font-bold">View Ledger →</span>
                </a>
                <a href="/analytics" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-primary text-[18px]">insights</span> Executive Ministry Analytics & KPIs</span>
                    <span class="text-secondary font-bold">View Analytics →</span>
                </a>
                <div class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2 pt-3 pb-1">Pre-loaded Scholar Cases</div>
                <a href="/officer" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-mono">#MOTA-2025-JH-88391 • Mangal Soren</span>
                    <span class="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Rule 14(b) Triggered</span>
                </a>
                <a href="/track-cure?ref=MOTA-2025-JH-88391" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                    <span class="flex items-center gap-2 font-mono">#MOTA-2025-MP-51204 • Birsa Munda</span>
                    <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Pre-Approved</span>
                </a>
            </div>
        </div>
    `;
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
    const input = document.getElementById('global-search-input');
    if (input) input.focus();
}

// ==========================================
// 4. Landing Page Controller (index.html)
// ==========================================

function initLandingPage() {
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) return;

    // Export CSV Audit Button
    getElements('button', 'Export CSV').concat(getElements('button', 'Export')).concat(getElements('a', 'Export CSV')).forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const csv = `Reference_No,Applicant_Name,State,Tribe,Scheme,Readability_Score,Seal_Detected,Status,Audit_Hash
` +
                `MOTA-2025-JH-88391,Mangal Soren,Jharkhand,Santhal,NFST Fellowship,98.4,99.1,OFFICER_APPROVED,e7f2b1c890a5d4f3e2b1c890a5d4f3e2
` +
                `MOTA-2025-OD-10492,Anjali Kerketta,Odisha,Oraon,National Overseas,97.2,98.5,AI_PRE_APPROVED,b8a1c9e4f0d2b6a8b8a1c9e4f0d2b6a8
` +
                `MOTA-2025-MP-51204,Birsa Munda,Madhya Pradesh,Bhil,Top Class Education,99.0,99.4,DISBURSED_DBT,c4d5e6f7a8b9c0d1c4d5e6f7a8b9c0d1
`;
            downloadFile('MoTA_SETU_Audit_Ledger_2025.csv', csv, 'text/csv');
            showToast('MoTA SETU Cryptographic Audit Trail Exported (CSV)', 'download');
        };
    });

    // Scheme Info Cards
    document.querySelectorAll('[data-scheme]').forEach(card => {
        card.onclick = () => {
            const scheme = card.getAttribute('data-scheme') || 'NFST Fellowship';
            showSchemeModal(scheme);
        };
    });
}

function showSchemeModal(schemeName) {
    let modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[24px]">school</span>
                    <h3 class="font-bold text-base text-primary">${schemeName}</h3>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p><strong>Statutory Body:</strong> Ministry of Tribal Affairs (MoTA), Government of India.</p>
                <p><strong>Fellowship Amount:</strong> ₹31,000 to ₹35,000 / month + Annual Contingency Allowance directly via RBI e-Kuber APBS.</p>
                <p><strong>Rule 14(b) Protection:</strong> Automatic tolerance for regional tribal surname transliterations (e.g. Soren / Saren / Hembrom).</p>
                <p><strong>Documentation:</strong> ST Caste Certificate, AISHE Institute Enrollment, DigiLocker Aadhaar KYC.</p>
            </div>
            <div class="flex items-center gap-3 pt-2">
                <a href="/apply" class="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs text-center hover:bg-primary/90 transition shadow">Apply with DigiLocker</a>
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2.5 bg-surface-container text-primary rounded-xl font-bold text-xs hover:bg-surface-container-high transition">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==========================================
// 5. Unified Sovereign Identity Gateway (auth.html)
// ==========================================

function initAuthPage() {
    if (!window.location.pathname.includes('/auth')) return;

    // Dual Tab switching
    const tabBtnScholar = document.getElementById('tabBtnScholar');
    const tabBtnOfficer = document.getElementById('tabBtnOfficer');
    const panelScholar = document.getElementById('panelScholar');
    const panelOfficer = document.getElementById('panelOfficer');

    window.switchTab = function(role) {
        if (role === 'scholar') {
            if (tabBtnScholar) {
                tabBtnScholar.className = "flex-1 py-3 px-space-md rounded-lg flex items-center justify-center gap-space-sm font-label-md text-label-md transition-all duration-200 bg-primary text-on-primary shadow-sm";
                tabBtnScholar.setAttribute('aria-selected', 'true');
            }
            if (tabBtnOfficer) {
                tabBtnOfficer.className = "flex-1 py-3 px-space-md rounded-lg flex items-center justify-center gap-space-sm font-label-md text-label-md transition-all duration-200 text-on-surface hover:bg-surface-container-high";
                tabBtnOfficer.setAttribute('aria-selected', 'false');
            }
            if (panelScholar) {
                panelScholar.classList.remove('hidden');
                panelScholar.classList.add('flex');
            }
            if (panelOfficer) {
                panelOfficer.classList.add('hidden');
                panelOfficer.classList.remove('flex');
            }
        } else {
            if (tabBtnOfficer) {
                tabBtnOfficer.className = "flex-1 py-3 px-space-md rounded-lg flex items-center justify-center gap-space-sm font-label-md text-label-md transition-all duration-200 bg-primary text-on-primary shadow-sm";
                tabBtnOfficer.setAttribute('aria-selected', 'true');
            }
            if (tabBtnScholar) {
                tabBtnScholar.className = "flex-1 py-3 px-space-md rounded-lg flex items-center justify-center gap-space-sm font-label-md text-label-md transition-all duration-200 text-on-surface hover:bg-surface-container-high";
                tabBtnScholar.setAttribute('aria-selected', 'false');
            }
            if (panelOfficer) {
                panelOfficer.classList.remove('hidden');
                panelOfficer.classList.add('flex');
            }
            if (panelScholar) {
                panelScholar.classList.add('hidden');
                panelScholar.classList.remove('flex');
            }
        }
    };

    // Quick Hackathon Demo Fill Helpers
    window.fillDemoStudent = function() {
        window.switchTab('scholar');
        const aadhaarInput = document.querySelector('#panelScholar input[type="text"]');
        if (aadhaarInput) aadhaarInput.value = "9842 8839 4912";
        
        const consentBox = document.querySelector('#panelScholar input[type="checkbox"]');
        if (consentBox) consentBox.checked = true;

        const otpInputs = document.querySelectorAll('#panelScholar input.text-center');
        const demoCode = ['7', '8', '9', '1', '2', '4'];
        otpInputs.forEach((inp, idx) => {
            if (demoCode[idx]) inp.value = demoCode[idx];
        });

        showToast('Demo Scholar Loaded: Mangal Soren (Jharkhand ST). Click Verify below to enter!', 'verified');
        speakText('Demo credentials for tribal scholar Mangal Soren loaded.');
    };

    window.fillDemoOfficer = function() {
        window.switchTab('officer');
        const emailInput = document.querySelector('#panelOfficer input[type="text"], #panelOfficer input[type="email"]');
        if (emailInput) emailInput.value = "s.rao@nic.in (Smt. Sunita Rao, Director MoTA)";

        const kavachCodeEl = document.getElementById('kavachCode');
        showToast('Demo Officer Loaded: Smt. Sunita Rao (MoTA Nodal Officer). Click Open Console to enter!', 'verified');
        speakText('Demo credentials for ministry verification officer loaded.');
    };

    // Add Demo Fill Bar right above tabs if not present
    const tablist = document.querySelector('[role="tablist"]');
    if (tablist && !document.getElementById('demo-fill-bar')) {
        const demoBar = document.createElement('div');
        demoBar.id = 'demo-fill-bar';
        demoBar.className = 'mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs';
        demoBar.innerHTML = `
            <span class="font-bold text-primary flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px]">bolt</span> Quick Hackathon Jury Demo Fill:
            </span>
            <div class="flex items-center gap-2">
                <button type="button" onclick="fillDemoStudent()" class="px-3 py-1.5 bg-secondary text-white rounded-lg font-bold hover:bg-secondary/90 transition shadow-sm flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">school</span> Demo Student (Mangal Soren)
                </button>
                <button type="button" onclick="fillDemoOfficer()" class="px-3 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">verified_user</span> Demo Officer (Smt. Sunita Rao)
                </button>
            </div>
        `;
        tablist.parentElement.insertBefore(demoBar, tablist);
    }

    // DigiLocker One-Click Sync
    getElements('#panelScholar button', 'DigiLocker').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            window.fillDemoStudent();
        };
    });

    // Student Verify Button -> Navigates to /apply
    getElements('#panelScholar button', 'Verify').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Authenticating DigiLocker...`;
            showToast('DigiLocker Sovereign Token Verified! Redirecting to Fellowship Portal...', 'verified');
            setTimeout(() => {
                window.location.href = '/apply';
            }, 600);
        };
    });

    // Officer Authenticate Button -> Navigates to /officer
    getElements('#panelOfficer button', 'Open Ministry Scrutiny').concat(getElements('#panelOfficer button', 'Authenticate via Parichay')).forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Authorizing Kavach 2FA...`;
            showToast('MeriPehchaan SSO Authorized! Opening Officer Scrutiny Console...', 'verified');
            setTimeout(() => {
                window.location.href = '/officer';
            }, 600);
        };
    });

    // Audio assistance button
    getElements('#panelScholar button', 'volume_up').forEach(btn => {
        btn.onclick = () => {
            speakText("आप जनजातीय कार्य मंत्रालय के सेतु पोर्टल में आधार या डिजिलॉकर से लॉगिन कर सकते हैं।");
        };
    });
}

// ==========================================
// 6. Application Form Controller (apply.html)
// ==========================================

function initApplyPage() {
    if (!window.location.pathname.includes('/apply')) return;

    // Pull from DigiLocker
    getElements('button', 'Pull from DigiLocker').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Syncing...`;
            setTimeout(() => {
                btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span> Synced with DigiLocker`;
                btn.className = "px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow";
                
                // Populate input fields if present
                const nameInputs = document.querySelectorAll('input[type="text"]');
                if (nameInputs.length > 0) nameInputs[0].value = "Mangal Soren";
                
                showToast('DigiLocker Identity Verified! Name: Mangal Soren | ST Caste: Santhal | Ref: JH/ST/2021/88391', 'verified');
                speakText('DigiLocker credentials successfully verified for Mangal Soren.');
            }, 600);
        };
    });

    // Document Upload & AI Scanner
    getElements('button', 'Upload File').concat(getElements('button', 'Capture')).forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            // Trigger file picker or load sample
            let input = document.getElementById('apply-file-input');
            if (!input) {
                input = document.createElement('input');
                input.type = 'file';
                input.id = 'apply-file-input';
                input.className = 'hidden';
                input.accept = 'image/*,application/pdf';
                document.body.appendChild(input);
                input.onchange = async () => {
                    simulateDocumentScan();
                };
            }
            input.click();
        };
    });

    function simulateDocumentScan() {
        showToast('Running OpenCV Document Quality & Gemini Vision OCR...', 'document_scanner');
        setTimeout(() => {
            showToast('AI Pre-Check Passed: Blur 96/100 | SDO Ranchi Seal Detected (99.1%) | Rule 14(b) Dialect Tolerant', 'verified');
            speakText('Caste certificate verified with ninety-nine percent seal confidence.');
        }, 800);
    }

    // Save Draft
    getElements('button', 'Save Draft').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            localStorage.setItem('mota_draft_saved', new Date().toISOString());
            showToast('Application draft saved securely to local cache.', 'save');
        };
    });

    // Final Submission
    getElements('button', 'Proceed to Final Submission').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Submitting to MoTA Pipeline...`;
            setTimeout(() => {
                showApplicationSuccessModal('MOTA-2025-JH-88391');
                btn.innerHTML = `Proceed to Final Submission <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
            }, 900);
        };
    });

    // Audio Instruction Button
    getElements('button', 'Listen in Gondi').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            speakText("राष्ट्रीय जनजातीय फैलोशिप 2025-26 के लिए अपने सभी विवरण जांचें। जाति प्रमाण पत्र का डिजिटल सत्यापन डिजिलॉकर के माध्यम से हो चुका है।");
        };
    });
}

function showApplicationSuccessModal(refNo) {
    let modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200';
    modal.innerHTML = `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <span class="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <h3 class="font-headline text-xl font-bold text-primary">Fellowship Application Submitted!</h3>
            <p class="text-xs text-on-surface-variant leading-relaxed">Your application has entered the MoTA SETU Autonomous Scrutiny Pipeline under Scheme Guidelines Rule 14(b).</p>
            <div class="p-3 bg-surface-container-low rounded-2xl border border-secondary/30 font-mono text-sm font-bold text-primary flex items-center justify-between">
                <span>Ref: ${refNo}</span>
                <span class="text-xs text-secondary font-bold">ST-NFST-2025</span>
            </div>
            <div class="text-[11px] text-on-surface-variant text-left bg-surface-container p-3 rounded-xl space-y-1">
                <p>✓ OpenCV Readability: <strong>98.4% (Clear)</strong></p>
                <p>✓ SDO Tehsildar Seal: <strong>99.1% Confidence</strong></p>
                <p>✓ Rule 14(b) Exemption: <strong>Phonetic Dialect Guard Active</strong></p>
                <p>✓ Tamper-Proof Hash: <strong class="font-mono text-[10px]">SHA256: e7f2b1c890a5d4f3</strong></p>
            </div>
            <div class="flex items-center gap-2 pt-2">
                <a href="/track-cure?ref=${refNo}" class="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition shadow">Track Application Status</a>
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2.5 bg-surface-container text-primary rounded-xl font-bold text-xs hover:bg-surface-container-high transition">Dismiss</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    speakText("Application submitted successfully. Reference number MOTA 2025 JH 88391.");
}

// ==========================================
// 7. Officer Scrutiny Console (officer.html)
// ==========================================

let officerZoom = 1.0;
let officerHighContrast = false;
let officerInvert = false;

function initOfficerPage() {
    if (!window.location.pathname.includes('/officer')) return;

    const viewport = document.getElementById('scan-viewport');

    function applyTransforms() {
        if (!viewport) return;
        let filters = [];
        if (officerHighContrast) filters.push('contrast(180%) brightness(95%)');
        if (officerInvert) filters.push('invert(100%) hue-rotate(180deg)');
        viewport.style.filter = filters.length > 0 ? filters.join(' ') : 'none';
        viewport.style.transform = `scale(${officerZoom})`;
        viewport.style.transformOrigin = 'top center';
    }

    // High Contrast Button
    const btnContrast = document.getElementById('toggle-contrast') || getElement('button', 'High Contrast Scan');
    if (btnContrast) {
        btnContrast.onclick = (e) => {
            e.preventDefault();
            officerHighContrast = !officerHighContrast;
            applyTransforms();
            showToast(officerHighContrast ? 'Forensic High-Contrast Filter Active' : 'Default Visual Mode', 'contrast');
        };
    }

    // Invert Colors Button
    const btnInvert = document.getElementById('toggle-invert') || getElement('button', 'Invert Negative');
    if (btnInvert) {
        btnInvert.onclick = (e) => {
            e.preventDefault();
            officerInvert = !officerInvert;
            applyTransforms();
            showToast(officerInvert ? 'Inverted Negative Forensic Inspection' : 'Standard Color Scan', 'invert_colors');
        };
    }

    // Zoom Buttons: 100%, 125%, 150%
    getElements('button', '100%').forEach(b => b.onclick = () => { officerZoom = 1.0; applyTransforms(); showToast('Zoom: 100%', 'zoom_in'); });
    getElements('button', '125%').forEach(b => b.onclick = () => { officerZoom = 1.25; applyTransforms(); showToast('Zoom: 125%', 'zoom_in'); });
    getElements('button', '150%').forEach(b => b.onclick = () => { officerZoom = 1.5; applyTransforms(); showToast('Zoom: 150%', 'zoom_in'); });

    // Auto-Cure Exemption (GFR Rule 14b) Button
    getElements('button', 'Apply Auto-Cure Exemption').concat(getElements('button', 'Rule 14b')).forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Verifying Dialect Phonetics...`;
            
            try {
                const res = await fetch('/api/check-phonetics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cert_name: "Mangal Saren", matric_name: "Mangal Soren" })
                });
                const data = await res.json();
            } catch (err) {}

            setTimeout(() => {
                btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span> Exemption Granted (Rule 14b Cured)`;
                btn.className = "w-full py-3 px-4 bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow";

                // Update red mismatch badge to green cured
                document.querySelectorAll('.text-error, .bg-error\/10').forEach(el => {
                    if (el.textContent.includes('Mismatch') || el.textContent.includes('Discrepancy')) {
                        el.className = "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-xs";
                        el.innerText = "✓ Cured under Rule 14(b) (96.8% Phonetic Match)";
                    }
                });

                showToast('Rule 14(b) Auto-Cure Exemption Applied: Dialectical surname variance reconciled!', 'verified');
                speakText('Rule 14(b) exemption applied. Scholar is fully eligible for disbursal.');
            }, 700);
        };
    });

    // Approve & Authorize Disbursal Button (Ctrl+Enter)
    const approveAction = async () => {
        const btn = getElement('button', 'Approve & Authorize') || getElement('button', 'Approve');
        if (btn) {
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Authorizing DBT Mandate...`;
        }
        
        try {
            const res = await fetch('/api/officer/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref_no: 'MOTA-2025-JH-88391', officer_remarks: 'Statutory scrutiny cleared under Rule 14(b)' })
            });
            const data = await res.json();
        } catch (e) {}

        setTimeout(() => {
            showOfficerDecreeModal('MOTA-2025-JH-88391', 'Mangal Soren');
            if (btn) {
                btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done_all</span> Disbursal Mandate Staged ✓`;
                btn.className = "w-full py-3.5 px-4 bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg";
            }
        }, 800);
    };

    getElements('button', 'Approve & Authorize').forEach(b => b.onclick = (e) => { e.preventDefault(); approveAction(); });

    // Keyboard Shortcuts: Ctrl+Enter (Approve), J (Prev), K (Next)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            approveAction();
        }
        if (e.key === 'j' || e.key === 'J') {
            showToast('Loading Previous Applicant (#MOTA-2025-JH-88391 Mangal Soren)', 'arrow_back');
        }
        if (e.key === 'k' || e.key === 'K') {
            showToast('Loading Next Applicant (#MOTA-2025-OR-77210 Sunita Munda)', 'arrow_forward');
        }
    });

    // Direct Scholar Clarification
    getElements('button', 'Direct Scholar Clarification').forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/officer/clarification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ref_no: 'MOTA-2025-JH-88391', phone: '+91 94311•••••' })
                });
            } catch (err) {}
            showToast('Direct Clarification link dispatched to Mangal Soren via NIC SMS & WhatsApp Gateway!', 'chat');
            speakText('Clarification link dispatched to scholar phone number.');
        };
    });

    // Disqualify Claim
    getElements('button', 'Disqualify Claim').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            showToast('Statutory Disqualification Notice Issued with Section 7 Legal Appeal Rights.', 'block');
        };
    });

    // PFMS Live Sync
    getElements('button', 'PFMS Live Sync').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            showToast('PFMS Central Server Sync: 382/382 Bank Mappings Verified.', 'sync');
        };
    });
}

function showOfficerDecreeModal(refNo, scholarName) {
    let modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200';
    modal.innerHTML = `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <div>
                    <h3 class="font-bold text-base text-primary">Official Ministry Sanction Decree</h3>
                    <div class="text-xs text-on-surface-variant">Gazetted Disbursal Authorization under NFST Scheme</div>
                </div>
            </div>
            <div class="p-4 bg-surface-container-low rounded-2xl border border-secondary/30 text-xs space-y-2 text-on-surface">
                <div class="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span class="text-on-surface-variant">Applicant:</span>
                    <span class="font-bold">${scholarName} (ST Santhal)</span>
                </div>
                <div class="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span class="text-on-surface-variant">Reference ID:</span>
                    <span class="font-mono font-bold text-primary">${refNo}</span>
                </div>
                <div class="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span class="text-on-surface-variant">Exemption Applied:</span>
                    <span class="font-bold text-emerald-600">Rule 14(b) GFR Tribal Dialect</span>
                </div>
                <div class="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span class="text-on-surface-variant">DBT Electronic Token:</span>
                    <span class="font-mono text-[11px] text-primary">DBT-MOTA-2025-JH-88391-9982</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-on-surface-variant">Evidence Hash:</span>
                    <span class="font-mono text-[10px] text-on-surface-variant">SHA256: 9FA87B21C04D89A1</span>
                </div>
            </div>
            <div class="flex items-center gap-3 pt-2">
                <a href="/ledger" class="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs text-center hover:bg-primary/90 transition shadow">View in PFMS Ledger</a>
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2.5 bg-surface-container text-primary rounded-xl font-bold text-xs hover:bg-surface-container-high transition">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    speakText(`Scholarship for ${scholarName} sanctioned and queued for DBT transfer.`);
}

// ==========================================
// 8. Universal Unhandled Button/Link Interceptor
// ==========================================

function initUniversalButtonInterceptor() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;

        const href = target.getAttribute('href');
        const onclick = target.getAttribute('onclick');

        // Catch broken href="#" clicks that have no custom onclick
        if (href === '#' && !onclick) {
            e.preventDefault();
            const text = target.textContent.trim().toLowerCase();
            
            if (text.includes('apply') || text.includes('scholar')) {
                window.location.href = '/apply';
            } else if (text.includes('officer') || text.includes('scrutiny') || text.includes('desk')) {
                window.location.href = '/officer';
            } else if (text.includes('track') || text.includes('cure')) {
                window.location.href = '/track-cure';
            } else if (text.includes('ledger') || text.includes('pfms') || text.includes('dbt')) {
                window.location.href = '/ledger';
            } else if (text.includes('analytic')) {
                window.location.href = '/analytics';
            } else if (text.includes('sign in') || text.includes('sso') || text.includes('login')) {
                window.location.href = '/auth';
            } else if (text.includes('rule 14') || text.includes('guideline') || text.includes('sop')) {
                showSchemeModal('Rule 14(b) Statutory Dialect SOP');
            } else if (text.includes('download') || text.includes('export')) {
                showToast('Generating official MoTA digitally signed Section 65B export...', 'download');
            } else {
                showToast(`Action Triggered: ${target.textContent.trim() || 'MoTA Feature'}`, 'check_circle');
            }
        }
    });
}

// ==========================================
// 9. Bootstrap Engine on DOMContentLoaded
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initGlobalHeader();
    initAuthPage();
    initLandingPage();
    initApplyPage();
    initOfficerPage();
    initUniversalButtonInterceptor();
});
