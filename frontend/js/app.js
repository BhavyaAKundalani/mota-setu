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

// ==========================================
// 8. Global Button Wiring & Sovereign Actions (Phase 3)
// ==========================================
function initButtonWiring() {
    // 1. Accessibility Font Size Controls (A-, A, A+)
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.innerText.trim();
        if (text === 'A-') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.documentElement.style.fontSize = '14px';
                showToast('Font size reduced (A-)', 'text_fields');
            });
        } else if (text === 'A') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.documentElement.style.fontSize = '16px';
                showToast('Standard font size restored (A)', 'text_fields');
            });
        } else if (text === 'A+') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.documentElement.style.fontSize = '18px';
                showToast('Font size enlarged (A+)', 'text_fields');
            });
        }
    });

    // 2. Navigation Attributes (data-path)
    const dataPathMap = {
        'home-gateway': '/',
        'apply-student-portal': '/apply',
        'officer-scrutiny-console': '/officer',
        'track-cure-defect': '/track-cure',
        'pfms-ledger': '/ledger',
        'executive-analytics': '/analytics',
        'sovereign-auth': '/auth'
    };

    document.querySelectorAll('[data-path]').forEach(el => {
        const pathKey = el.getAttribute('data-path');
        if (dataPathMap[pathKey]) {
            const targetUrl = dataPathMap[pathKey];
            if (el.tagName === 'A') el.setAttribute('href', targetUrl);
            el.addEventListener('click', (e) => {
                if (el.tagName !== 'A' || el.getAttribute('href') === '#' || !el.getAttribute('href')) {
                    e.preventDefault();
                    window.location.href = targetUrl;
                }
            });
        }
    });

    // 3. Navigation Keywords Mapping (Buttons & Links)
    const textRoutes = [
        { patterns: ['sign in', 'sovereign sso', 'login', 'officer sso', 'authenticate via parichay'], path: '/auth' },
        { patterns: ['student self-service', 'apply portal', 'apply now', 'apply for scholarship', 'fresh fellowship'], path: '/apply' },
        { patterns: ['desktop scrutiny', 'officer console', 'officer desk', 'scrutiny workspace', 'open console'], path: '/officer' },
        { patterns: ['track application', 'track record', 'track & cure', 'track status', 'track your fellowship'], path: '/track-cure' },
        { patterns: ['pfms ledger', 'disbursal ledger', 'view ledger', 'ledger →', 'ledger ->'], path: '/ledger' },
        { patterns: ['executive dashboard', 'executive analytics', 'view analytics', 'analytics & kpi'], path: '/analytics' },
        { patterns: ['gateway', 'home / gateway'], path: '/' }
    ];

    document.querySelectorAll('button, a').forEach(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        for (const route of textRoutes) {
            for (const pat of route.patterns) {
                if (text.includes(pat)) {
                    if (el.tagName === 'A' && (el.getAttribute('href') === '#' || !el.getAttribute('href'))) {
                        el.setAttribute('href', route.path);
                    }
                    el.addEventListener('click', (e) => {
                        if (el.tagName === 'BUTTON' || el.getAttribute('href') === '#' || !el.getAttribute('href')) {
                            e.preventDefault();
                            window.location.href = route.path;
                        }
                    });
                    break;
                }
            }
        }
    });

    // 4. Dialect Audio & Voice Help Buttons
    document.querySelectorAll('button').forEach(btn => {
        const t = btn.innerText.trim();
        if (t.includes('ध्वनि सहायता') || t === 'हिन्दी' || t === 'संताली' || t === 'गोंडी') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = t.includes('संताली') ? 'Santhali' : (t.includes('गोंडी') ? 'Gondi' : 'Hindi');
                showToast('Playing sovereign advisory in ' + lang + ' dialect', 'volume_up');
                if ('speechSynthesis' in window) {
                    const msg = new SpeechSynthesisUtterance();
                    msg.text = lang === 'Santhali' 
                        ? 'Johar! MoTA SETU re sanam santhal vidyarthi ko sagun daram.' 
                        : (lang === 'Gondi' ? 'Seva! MoTA SETU te sava adivasi vidyarthi kahan mandai.' : 'जोहार! जनजातीय कार्य मंत्रालय के सेतु पोर्टल में आपका स्वागत है।');
                    msg.lang = 'hi-IN';
                    window.speechSynthesis.speak(msg);
                }
            });
        }
    });

    // 5. Export / Download CSV & Dossier
    document.querySelectorAll('button, a').forEach(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        if (text.includes('export') || text.includes('dossier') || text.includes('csv audit')) {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                showToast('Compiling Section 65B Cryptographic Ledger Export...', 'sync');
                try {
                    const res = await fetch('/api/ledger');
                    const data = await res.json();
                    let csv = 'Batch ID,Ref No,Scholar Name,Scheme,Aadhaar Mask,Bank Name,Account Mask,IFSC,Monthly Grant (INR),NPCI Status,Settlement Status,Timestamp,SHA256 Hash\\n';
                    const rows = (data && (data.rows || data.ledger)) ? (data.rows || data.ledger) : [];
                    if (rows.length > 0) {
                        rows.forEach(r => {
                            csv += `"${r.batch_id}","${r.ref_no}","${r.scholar_name}","${r.scheme}","${r.aadhaar_hash}","${r.bank_name}","${r.account_masked}","${r.ifsc}",${r.monthly_grant},"${r.npci_status}","${r.settlement_status}","${r.timestamp}","${r.ledger_hash}"\n`;
                        });
                    } else {
                        csv += '"#MOTA-DBT-2025-11","MOTA-2025-JH-88391","Mangal Soren","NFST Fellowship","•••• 9104","State Bank of India","•••• 4892","SBIN0000167",38800,"Active / Seeded","Ready for Disbursal","2025-11-25 10:00:00","7f8a3b21c44e9901"\\n';
                    }
                    downloadFile('MoTA_SETU_PFMS_Ledger_Sec65B.csv', csv, 'text/csv');
                    showToast('MoTA SETU Ledger exported successfully', 'download_done');
                } catch (err) {
                    const fallbackCsv = 'Batch ID,Ref No,Scholar Name,Scheme,Monthly Grant\\n#MOTA-DBT-2025-11,MOTA-2025-JH-88391,Mangal Soren,NFST Fellowship,38800\\n';
                    downloadFile('MoTA_SETU_PFMS_Ledger.csv', fallbackCsv, 'text/csv');
                    showToast('Ledger exported successfully', 'download_done');
                }
            });
        }

        // 6. Section 65B Audit Certificate
        if (text.includes('sec 65b audit certificate') || text.includes('audit certificate')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                downloadCertificateTemplate();
            });
        }
        
        // 7. Print Receipt / Reports
        if (text.includes('print')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                window.print();
            });
        }
        
        // 8. Clarification / Direct Scholar Link (Officer Desk)
        if (text.includes('scholar clarification') || text.includes('sms/whatsapp link')) {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                showToast('Dispatching SMS & WhatsApp 1-Click Photo Re-Upload Link to Scholar...', 'sms');
                try {
                    await fetch('/api/officer/clarification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ref_no: 'MOTA-2025-JH-88391', action: 'DISPATCH_CURE_LINK' })
                    });
                } catch (_) {}
                setTimeout(() => {
                    showToast('SMS & WhatsApp self-cure link delivered to 9876•••210 (Mangal Soren)', 'verified');
                }, 1000);
            });
        }

        // 9. Disqualify / Adverse Order
        if (text.includes('disqualify claim')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('STATUTORY NOTICE: MoTA rules mandate a 15-day defect cure window prior to any rejection. Do you wish to issue a Formal Defect Notice instead of outright rejection?')) {
                    showToast('Pre-rejection cure notice dispatched per GFR Rule 14(b)', 'assignment_late');
                }
            });
        }

        // 10. Filter Buttons in Analytics & Ledgers
        if (text === 'all states' || text === 'high pvtg density' || text === 'aspirational districts' || text === 'active / seeded' || text === 'needs attention') {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                el.parentElement.querySelectorAll('button').forEach(b => {
                    b.classList.remove('bg-primary', 'text-white', 'font-bold');
                    b.classList.add('bg-surface-container-lowest', 'text-on-surface');
                });
                el.classList.add('bg-primary', 'text-white', 'font-bold');
                el.classList.remove('bg-surface-container-lowest', 'text-on-surface');
                showToast('Filter applied: ' + el.innerText.trim(), 'filter_list');
            });
        }
    });
    
    // 11. Active Nav Link Highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if(href && currentPath.includes(href) && href !== '/' || (href === '/' && (currentPath === '/' || currentPath === ''))) {
            link.classList.remove('text-on-surface-variant');
            link.classList.add('bg-surface-container', 'text-on-surface', 'font-bold');
        } else {
            link.classList.add('text-on-surface-variant');
            link.classList.remove('bg-surface-container', 'text-on-surface', 'font-bold');
        }
    });
}

// Download Official Certificate Template / Form 5
function downloadCertificateTemplate() {
    const certText = `GOVERNMENT OF INDIA
MINISTRY OF TRIBAL AFFAIRS (MoTA)
AUTOMATED TRIBAL SCHOLARSHIP SCRUTINY ENGINE (SETU)

============================================================
STATUTORY AUDIT CERTIFICATE UNDER SECTION 65B INDIAN EVIDENCE ACT
============================================================

1. System Identifier: MoTA-SETU-PROD-ENCLAVE-04
2. Application Reference: MOTA-2025-JH-88391
3. Candidate Name: Mangal Soren (मंगल सोरेन)
4. Caste Certificate Ref: JH/ST/2021/892014
5. Issuing Authority: Sub-Divisional Officer, Sadar Ranchi
6. Scheduled Tribe Community: Santhal (Listed in Jharkhand ST Schedule #29)
7. Rule 14(b) Gazette Match: Soren / Saren Phonetic Similarity = 96.8% (EXEMPTION SEALED)
8. Faded Revenue Seal Contrast: SDO Ranchi Stamp OCR Confidence = 99.1%
9. Academic Institution: Central University of Jharkhand (AISHE U-0205)
10. Bank Account: State Bank of India (•••• 4892) - APBS Seeded
11. Direct Benefit Transfer Sanction: ₹38,800 / month
12. Cryptographic SHA-256 Stamp: 7f8a3b21c44e99015d88019ab921cba3

This is an electronically generated sovereign instrument certifying full compliance
with MoTA GFR Schedule 2024 and DPDPA 2023. Valid for legal and RTI inquiries.

Controller of Certifying Authorities, Ministry of Tribal Affairs`;

    downloadFile('MoTA_SETU_Sec65B_Certificate_MOTA-2025-JH-88391.txt', certText, 'text/plain');
    showToast('Section 65B Statutory Certificate downloaded', 'verified');
}


// ==========================================
// 12. Officer Candidate Cycling & Scrutiny Engine
// ==========================================

const OFFICER_CANDIDATES = [
    {
        ref: "MOTA-2025-JH-88391",
        name: "Mangal Soren (मंगल सोरेन)",
        tribalCommunity: "Santhal (संथाल)",
        state: "Jharkhand",
        district: "Ranchi (Schedule V)",
        casteCertNo: "JH/ST/2021/892014",
        authority: "Sub-Divisional Officer, Sadar Ranchi",
        institution: "Central University of Jharkhand (AISHE U-0205)",
        course: "Ph.D. in Tribal Linguistics & Folklore",
        monthlyFellowship: "₹38,800 / month",
        disbursalAmount: "₹2,32,800 (6 Months H1)",
        bankAccount: "State Bank of India (•••• 4892)",
        ifsc: "SBIN0000166",
        apbsStatus: "Active Aadhaar Seeded",
        digilockerVerified: true,
        rule14bMatch: "96.8% Phonetic Match ('Soren' vs 'Saren')",
        sealStatus: "Faded Revenue Seal (99.1% OCR Confidence)",
        trustScore: "98.4%",
        avatar: "assets/scholar.jpeg",
        portrait: "assets/scholar.jpeg"
    },
    {
        ref: "MOTA-2025-OD-77215",
        name: "Anjali Kerketta (अंजलि केरकेट्टा)",
        tribalCommunity: "Oraon (कुड़ुख / उरांव)",
        state: "Odisha",
        district: "Sundargarh (Schedule V)",
        casteCertNo: "OD/ST/2022/441092",
        authority: "Tahasildar, Panposh Sundargarh",
        institution: "Ravenshaw University, Cuttack (AISHE U-0361)",
        course: "M.Sc. in Biotechnology & Phytomedicine",
        monthlyFellowship: "₹38,800 / month",
        disbursalAmount: "₹2,32,800 (6 Months H1)",
        bankAccount: "Punjab National Bank (•••• 6128)",
        ifsc: "PUNB0124400",
        apbsStatus: "Active Aadhaar Seeded",
        digilockerVerified: true,
        rule14bMatch: "100% Exact Standard Match",
        sealStatus: "Clear Tahasildar Digital Seal",
        trustScore: "99.9%",
        avatar: "assets/anjali_portrait.jpeg",
        portrait: "assets/anjali_portrait.jpeg"
    },
    {
        ref: "MOTA-2025-JH-91044",
        name: "Birsa Munda (बिरसा मुंडा)",
        tribalCommunity: "Munda (मुंडा)",
        state: "Jharkhand",
        district: "Khunti (PVTG High Density)",
        casteCertNo: "JH/ST/2020/118234",
        authority: "SDO, Khunti Subdivision",
        institution: "Birla Institute of Technology, Mesra (AISHE U-0202)",
        course: "M.Tech in Remote Sensing & Water Resources",
        monthlyFellowship: "₹38,800 / month",
        disbursalAmount: "₹2,32,800 (6 Months H1)",
        bankAccount: "Bank of India (•••• 7731)",
        ifsc: "BKID0004910",
        apbsStatus: "Active Aadhaar Seeded",
        digilockerVerified: true,
        rule14bMatch: "98.2% Direct Lineage Match",
        sealStatus: "Verified Sub-Divisional Stamp",
        trustScore: "99.5%",
        avatar: "assets/hero.jpeg",
        portrait: "assets/hero.jpeg"
    },
    {
        ref: "MOTA-2025-WB-66403",
        name: "Somi Marandi (सोमी मरांडी)",
        tribalCommunity: "Santhal (संथाल)",
        state: "West Bengal",
        district: "Purulia (Jangalmahal Region)",
        casteCertNo: "WB/ST/2023/771209",
        authority: "Sub-Divisional Officer, Raghunathpur",
        institution: "Jadavpur University, Kolkata (AISHE U-0573)",
        course: "M.Phil. in Comparative Literature",
        monthlyFellowship: "₹38,800 / month",
        disbursalAmount: "₹2,32,800 (6 Months H1)",
        bankAccount: "India Post Payments Bank (•••• 3302)",
        ifsc: "IPOS0000001",
        apbsStatus: "Active IPPB Biometric Seeded",
        digilockerVerified: true,
        rule14bMatch: "95.4% Dialect Patronymic Match",
        sealStatus: "High Contrast Digital QR Validated",
        trustScore: "97.8%",
        avatar: "assets/sahayak.jpeg",
        portrait: "assets/sahayak.jpeg"
    }
];

let currentCandidateIndex = 0;

function loadCandidate(refOrIndex) {
    let candidate;
    if (typeof refOrIndex === 'number') {
        currentCandidateIndex = (refOrIndex + OFFICER_CANDIDATES.length) % OFFICER_CANDIDATES.length;
        candidate = OFFICER_CANDIDATES[currentCandidateIndex];
    } else {
        const idx = OFFICER_CANDIDATES.findIndex(c => c.ref === refOrIndex || c.name.toLowerCase().includes(refOrIndex.toLowerCase()));
        if (idx !== -1) {
            currentCandidateIndex = idx;
            candidate = OFFICER_CANDIDATES[idx];
        } else {
            candidate = OFFICER_CANDIDATES[0];
        }
    }

    // Update UI elements across officer desk
    document.querySelectorAll('[data-candidate-ref], #claim-ref-display, #header-ref-pill').forEach(el => el.textContent = candidate.ref);
    document.querySelectorAll('[data-candidate-name], #claim-name-display, #candidate-headline').forEach(el => el.textContent = candidate.name);
    document.querySelectorAll('[data-candidate-community]').forEach(el => el.textContent = candidate.tribalCommunity);
    document.querySelectorAll('[data-candidate-institution]').forEach(el => el.textContent = candidate.institution);
    document.querySelectorAll('[data-candidate-cert]').forEach(el => el.textContent = candidate.casteCertNo);

    // Update candidate avatar/portrait if present
    const portrait = document.getElementById('candidate-portrait-img');
    if (portrait && candidate.portrait) {
        portrait.src = candidate.portrait;
    }

    const counter = document.getElementById('candidate-counter');
    if (counter) {
        counter.textContent = `${currentCandidateIndex + 1} of ${OFFICER_CANDIDATES.length}`;
    }

    showToast(`Loaded candidate file: ${candidate.name} (${candidate.ref})`, 'badge');
}

function navigateCandidate(delta) {
    loadCandidate(currentCandidateIndex + delta);
}

function applyAutoCureExemption() {
    const btn = document.getElementById('btn-autocure');
    if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">verified</span> <span>Rule 14(b) Exemption Granted (Tamper-Proof)</span>';
        btn.classList.remove('bg-primary');
        btn.classList.add('bg-secondary', 'text-on-secondary');
    }

    const scoreBadge = document.querySelector('.trust-score-badge, [data-trust-score]');
    if (scoreBadge) scoreBadge.textContent = '100% (Statutory Override)';

    showToast('MoTA Gazette Rule 14(b) exemption applied. Candidate auto-cured for disbursal.', 'verified');
    if (typeof speakText === 'function') {
        speakText('नियम चौदह बी के अंतर्गत उपनाम भिन्नता को मान्य कर दिया गया है।');
    }
}

function authorizeCurrentCandidate() {
    const btn = document.getElementById('btn-authorize');
    const cand = OFFICER_CANDIDATES[currentCandidateIndex] || OFFICER_CANDIDATES[0];
    const txnToken = 'PFMS-MOTA-2025-' + Math.floor(100000 + Math.random() * 900000);

    if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[22px]">task_alt</span> <span>Authorized (${txnToken})</span>`;
        btn.classList.remove('bg-secondary');
        btn.classList.add('bg-primary');
    }

    showToast(`Claim ${cand.ref} approved! PFMS Electronic Token: ${txnToken}`, 'check_circle', 5000);
    if (typeof speakText === 'function') {
        speakText('छात्रवृत्ति स्वीकृत कर दी गई है। पी एफ एम एस टोकन जनरेट हो चुका है।');
    }
}

// ==========================================
// 13. File Generation & Download Handlers
// ==========================================

function downloadForm5Template() {
    const doc = `GOVERNMENT OF INDIA
MINISTRY OF TRIBAL AFFAIRS (MoTA)
NATIONAL TRIBAL SCHOLARSHIPS DIVISION

FORM 5: STATUTORY RECTIFICATION & SELF-DECLARATION UNDER GFR RULE 14(B)
(For Patronymic Surname Variations & Revenue Seal Clarifications)

To:
The Competent Scrutiny Authority / Desk Officer,
Ministry of Tribal Affairs, Shastri Bhawan, New Delhi 110001.

Subject: Submission of Supporting Affidavit / Re-Attestation for Fellowship Disbursal

I, ___________________________________ (Applicant Name),
residing at: Village/Ward: ________________________,
Tehsil/Block: ________________________, District: ________________________, State: ________________________,
holding Tribal Scholarship Reference No: ________________________,
do hereby solemnly affirm and state on oath as follows:

1. I belong to the ________________________ Scheduled Tribe community, recognized under the Presidential Constitution (Scheduled Tribes) Order, 1950.
2. In my Caste Certificate No: ________________________ dated ________________________, issued by the office of ________________________, my surname is written as '________________________'.
3. In my Aadhaar Card (No: XXXX-XXXX-________) and University enrollment records, my surname is transcribed phonetically as '________________________'.
4. I affirm that both names refer to one and the same person, protected under MoTA Gazette Notification Rule 14(b) (Phonetic Equivalence Doctrine).
5. Attached herewith is the attested copy of my high-resolution digital caste certificate / Tehsildar verification slip.

Deponent Signature: _______________________
Date: _______________________
Place: _______________________

VERIFICATION BY GAZETTED OFFICER / REVENUE TEHSILDAR / UNIVERSITY HEAD:
Certified that the deponent is a bona fide scholar and student of this institution.

Seal & Signature: _______________________
Designation: _______________________
Office Address: _______________________`;

    downloadFile('MoTA_Form5_Statutory_Declaration_Template.txt', doc, 'text/plain');
    showToast('Form 5 Statutory Rectification Template downloaded', 'download');
}

function downloadSec65BCertificate() {
    downloadCertificateTemplate();
}

function downloadRawTIFF() {
    const tiffHeader = `MoTA FORENSIC ARCHIVE - HIGH RESOLUTION DIGILOCKER TIFF EXTRACT
Document: SDO Ranchi ST Certificate Scanned Record (1200 DPI Forensic Grade)
Ref: JH/ST/2021/892014
Hash: 9e24b4c736f1c48f804598d1a499317d7211bf7cf4983d57d59a224a1b06821d
OCR Contrast Score: 99.1%
Sealed By: National Informatics Centre Digital Preservation Repository

[BINARY FORENSIC IMAGE PAYLOAD ATTACHED - FORMAT: TIFF/RAW]`;

    downloadFile('SDO_Ranchi_Caste_Certificate_1200DPI_Forensic.txt', tiffHeader, 'text/plain');
    showToast('High-Resolution Forensic Document TIFF extract downloaded', 'image');
}

function downloadPFMSScroll() {
    const csvRows = [
        ["Record_ID", "Scholar_Name", "Aadhaar_Virtual_Hash", "Bank_Name", "Account_Last4", "IFSC", "Scheme", "Sanction_Tranche", "Amount_INR", "APBS_Status", "PFMS_Batch_ID", "Timestamp_IST"],
        ["1", "Mangal Soren", "UIDAI-9918-B921-JH", "State Bank of India", "4892", "SBIN0000166", "NFST-PhD", "2024-25-Q3", "232800", "SUCCESS", "PFMS-JH-2025-00192", "2025-01-20 10:14:02"],
        ["2", "Anjali Kerketta", "UIDAI-7721-C410-OD", "Punjab National Bank", "6128", "PUNB0124400", "NFST-MSc", "2024-25-Q3", "232800", "SUCCESS", "PFMS-OD-2025-00281", "2025-01-20 10:14:03"],
        ["3", "Birsa Munda", "UIDAI-1182-M104-JH", "Bank of India", "7731", "BKID0004910", "NFST-MTech", "2024-25-Q3", "232800", "SUCCESS", "PFMS-JH-2025-00193", "2025-01-20 10:14:04"],
        ["4", "Somi Marandi", "UIDAI-7712-W664-WB", "India Post Payments Bank", "3302", "IPOS0000001", "NFST-MPhil", "2024-25-Q3", "232800", "SUCCESS", "PFMS-WB-2025-00089", "2025-01-20 10:14:05"],
        ["5", "Rameshwar Uraon", "UIDAI-3391-U210-CT", "Central Bank of India", "9102", "CBIN0280112", "Post-Matric", "2024-25-Q3", "48000", "SUCCESS", "PFMS-CT-2025-00412", "2025-01-20 10:14:06"]
    ];

    const csvContent = csvRows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    downloadFile(`PFMS_DBT_Scroll_Disbursal_Batch_${Date.now()}.csv`, csvContent, 'text/csv');
    showToast('PFMS DBT Batch Disbursal Scroll downloaded (CSV)', 'table_view');
}

function downloadAnalyticsDossier() {
    const dossier = `================================================================================
MINISTRY OF TRIBAL AFFAIRS - GOVERNMENT OF INDIA
NATIONAL TRIBAL SCHOLARSHIPS EQUITY & DISBURSAL DOSSIER 2024-25
Certified Under Section 65B Indian Evidence Act | NIC Encrypted Audit Log
================================================================================

EXECUTIVE SUMMARY:
- Total Disbursed via PFMS (YTD): ₹688.42 Crores
- Total Beneficiaries: 83,491 Scholars
- Average Turnaround Time: 4.2 Days (down from 148 days in manual regime)
- Rule 14(b) Phonetic Auto-Cure Success: 99.4%
- Zero Intermediary Leakage: 100% Direct APBS Bank Account Seeding
- PVTG (Particularly Vulnerable Tribal Groups) Coverage: 18,920 Scholars (22.7%)
- Gender Parity Index: 1.17 (54% Female Scholars across NFST & NOS)

STATE-WISE EQUITY RECONCILIATION:
1. Jharkhand: ₹142.10 Cr Disbursed | 18,940 Scholars | Santhal, Munda, Oraon, Ho
2. Odisha: ₹128.50 Cr Disbursed | 16,810 Scholars | Kondh, Santhal, Saora
3. Chhattisgarh: ₹98.20 Cr Disbursed | 12,400 Scholars | Gond, Baiga, Kamar
4. Madhya Pradesh: ₹110.80 Cr Disbursed | 14,200 Scholars | Bhil, Gond, Sahariya
5. North Eastern States: ₹124.60 Cr Disbursed | 13,910 Scholars | Garo, Khasi, Mizo, Naga
6. Rest of India: ₹84.22 Cr Disbursed | 7,231 Scholars

INFRASTRUCTURE PARTNERS:
- Authentication & Digital KYC: Unique Identification Authority of India (UIDAI)
- Document Vault: DigiLocker / Ministry of Electronics & IT (MeitY)
- Payment Pipeline: Public Financial Management System (PFMS) & NPCI APBS
- Audit & Security Hosting: National Informatics Centre (NIC)`;

    downloadFile(`MoTA_SETU_National_Equity_Dossier_2025.txt`, dossier, 'text/plain');
    showToast('MoTA National Tribal Equity & Disbursal Dossier downloaded', 'insights');
}

function downloadAuditCSV() {
    downloadPFMSScroll();
}

// ==========================================
// 14. Modals & Dialog Controllers
// ==========================================

function showLegalModal(type) {
    let title = "Government of India Statutory Policy";
    let body = "";

    switch(type) {
        case 'RTI':
            title = "Right to Information (RTI) Manual - MoTA Section 4(1)(b)";
            body = `<p class="mb-3">In compliance with Section 4(1)(b) of the Right to Information Act, 2005, the Ministry of Tribal Affairs proactively publishes the complete algorithmic logic, disbursement scrolls, and decision-tree criteria employed by the SETU scrutiny platform.</p>
            <p class="mb-3"><strong>Key RTI Disclosures:</strong></p>
            <ul class="list-disc pl-5 space-y-1 mb-3 text-xs">
                <li>Automated scrutiny operates under Central Civil Services Rules and General Financial Rules (GFR).</li>
                <li>All phonetic distance scoring (Levenshtein & Soundex) thresholds are fixed by MoTA Gazette 2022.</li>
                <li>No candidate application can be rejected by automated algorithms alone without mandatory human review and 15-day defect cure window.</li>
            </ul>
            <p class="text-xs text-on-surface-variant">Central Public Information Officer (CPIO): Shri V. Sharma, Director (Tribal Welfare), Shastri Bhawan, New Delhi.</p>`;
            break;
        case 'DPDPA':
            title = "Data Protection & Tribal Privacy Policy (DPDPA 2023)";
            body = `<p class="mb-3">MoTA SETU strictly adheres to the Digital Personal Data Protection Act (DPDPA), 2023. All scholar demographic, biometric, and financial records are processed exclusively for scholarship disbursement and sovereign welfare tracking.</p>
            <ul class="list-disc pl-5 space-y-1 mb-3 text-xs">
                <li><strong>No Commercial Monetization:</strong> Tribal citizen data is never shared with commercial data brokers or private third parties.</li>
                <li><strong>Cryptographic Enclaves:</strong> Aadhaar numbers are tokenized using SHA-256 virtual IDs.</li>
                <li><strong>Purpose Limitation:</strong> Data collected under DigiLocker consent is restricted solely to the applied academic cycle.</li>
            </ul>`;
            break;
        case 'SLA':
            title = "Public Service Level Agreement (SLA) & Citizen Charter";
            body = `<p class="mb-3">Under the MoTA Citizen Charter, the ministry commits to the following time-bound service milestones:</p>
            <ul class="list-disc pl-5 space-y-1 mb-3 text-xs">
                <li><strong>DigiLocker Pre-Scrutiny:</strong> Instantaneous (< 30 seconds)</li>
                <li><strong>Defect Notice Issuance:</strong> Within 48 hours of application submission</li>
                <li><strong>Statutory Cure Window:</strong> Minimum 15 calendar days granted to scholar</li>
                <li><strong>PFMS Account Credit:</strong> Within 72 hours of officer scrutiny sign-off</li>
            </ul>`;
            break;
        case 'Rule14b':
            title = "Directives for Institutional Scrutiny - Gazette Rule 14(b)";
            body = `<p class="mb-3"><strong>Ministry of Tribal Affairs Gazette Notification F. No. 11015/02/2022-Scholarship:</strong></p>
            <p class="mb-3 text-xs leading-relaxed">"Whereas tribal surnames and family titles exhibit widespread phonetic, dialectal, and Anglicized spelling variations across state revenue documents (e.g., Soren/Saren, Kerketta/Kerketa, Murmu/Mormo, Hembram/Hembrom, Marandi/Marndi);</p>
            <p class="mb-3 text-xs leading-relaxed">It is hereby decreed that where the phonetic match between the caste certificate and secondary school/Aadhaar record exceeds 85%, designated scrutiny officers SHALL NOT reject the claim or demand gazette name-change affidavits. The variation stands cured by administrative decree."</p>`;
            break;
        case 'Vigilance':
            title = "Chief Vigilance Officer (CVO) Portal";
            body = `<p class="mb-3">To report corruption, extortion, fraudulent claims, or unauthorized broker interference in tribal scholarships:</p>
            <div class="p-3 bg-surface-container rounded-lg space-y-1 text-xs">
                <p><strong>Chief Vigilance Officer:</strong> Smt. R. Meena, Joint Secretary & CVO</p>
                <p><strong>Address:</strong> Room 402, B-Wing, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi</p>
                <p><strong>Email:</strong> vigilance-tribal@nic.in | Toll-Free Vigilance Helpline: 1800-11-2244</p>
            </div>`;
            break;
        default:
            title = "MoTA SETU Governance Policy";
            body = `<p>Ministry of Tribal Affairs automated scholarship scrutiny infrastructure complies with Central Government statutory directives.</p>`;
    }

    let modal = document.getElementById('mota-legal-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mota-legal-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-surface-container-lowest text-on-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[24px]">gavel</span>
                    <h3 class="font-headline-sm text-headline-sm text-primary font-bold">${title}</h3>
                </div>
                <button onclick="closeLegalModal()" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto text-sm leading-relaxed pr-2">
                ${body}
            </div>
            <div class="mt-6 pt-3 border-t border-outline-variant flex items-center justify-between">
                <span class="text-xs text-on-surface-variant">Ministry of Tribal Affairs | Government of India</span>
                <button onclick="closeLegalModal()" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container">
                    Acknowledged
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeLegalModal() {
    const modal = document.getElementById('mota-legal-modal');
    if (modal) modal.classList.add('hidden');
}

function openClarificationModal() {
    let modal = document.getElementById('clarification-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'clarification-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }

    const cand = OFFICER_CANDIDATES[currentCandidateIndex] || OFFICER_CANDIDATES[0];
    modal.innerHTML = `
        <div class="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant flex flex-col">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-[24px]">sms</span>
                    <h3 class="font-headline-sm text-headline-sm text-primary font-bold">Dispatch Scholar Clarification Link</h3>
                </div>
                <button onclick="closeClarificationModal()" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="space-y-4 text-sm">
                <div class="p-3 bg-secondary-container/20 rounded-xl text-xs text-secondary">
                    <strong>1-Click Mobile Cure Link:</strong> Scholar will receive an encrypted SMS & WhatsApp link to take a high-res photo of the requested document without visiting any government office.
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Scholar Recipient</label>
                    <input type="text" readonly value="${cand.name} (${cand.ref})" class="w-full px-3 py-2 bg-surface-container rounded-lg text-xs font-medium border border-outline-variant"/>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Select Defect Reason</label>
                    <select id="clarification-reason-select" class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs border border-outline-variant">
                        <option value="SEAL">Faded Revenue Seal - Please re-upload clear photo of Tehsildar Stamp</option>
                        <option value="NAME">Dialect Surname Confirmation - Please confirm Father's patronymic spelling</option>
                        <option value="BANK">Bank Account NPCI Seeding - Please link mobile to Aadhaar at nearest Post Office</option>
                        <option value="BONAFIDE">University Enrollment Verification - Upload current semester fee receipt</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Custom Officer Remarks (Optional)</label>
                    <textarea id="clarification-remarks" rows="3" placeholder="Explain the defect in simple words..." class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs border border-outline-variant focus:outline-primary"></textarea>
                </div>
            </div>
            <div class="mt-6 flex items-center justify-end gap-3">
                <button onclick="closeClarificationModal()" class="px-4 py-2 border border-outline rounded-lg text-xs font-semibold">Cancel</button>
                <button onclick="sendClarificationLink()" class="px-5 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold flex items-center gap-1.5 shadow hover:opacity-95">
                    <span class="material-symbols-outlined text-[16px]">send</span>
                    <span>Dispatch SMS & WhatsApp Link</span>
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeClarificationModal() {
    const modal = document.getElementById('clarification-modal');
    if (modal) modal.classList.add('hidden');
}

function sendClarificationLink() {
    const cand = OFFICER_CANDIDATES[currentCandidateIndex] || OFFICER_CANDIDATES[0];
    closeClarificationModal();
    showToast(`1-Click Self-Cure Link dispatched to registered mobile of ${cand.name}`, 'verified', 4000);
    if (typeof speakText === 'function') {
        speakText('छात्र के मोबाइल पर त्रुटि सुधार लिंक भेज दिया गया है।');
    }
}

function openDisqualifyModal() {
    let modal = document.getElementById('disqualify-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'disqualify-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }

    const cand = OFFICER_CANDIDATES[currentCandidateIndex] || OFFICER_CANDIDATES[0];
    modal.innerHTML = `
        <div class="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-error/30 flex flex-col">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                <div class="flex items-center gap-2 text-error">
                    <span class="material-symbols-outlined text-[24px]">gavel</span>
                    <h3 class="font-headline-sm text-headline-sm text-error font-bold">Statutory Pre-Rejection Notice</h3>
                </div>
                <button onclick="closeDisqualifyModal()" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="space-y-3 text-sm">
                <div class="p-3 bg-error-container/40 rounded-xl text-xs text-error border border-error/20">
                    <strong>MANDATORY STATUTORY SAFEGUARD:</strong> MoTA GFR Directives prohibit outright rejection of Scheduled Tribe fellowship claims without granting a formal 15-day defect cure window.
                </div>
                <p class="text-xs text-on-surface-variant">
                    Passing this order will not disqualify the candidate immediately. Instead, a formal Notice of Proposed Disqualification with a 15-day cure timer will be dispatched to <strong>${cand.name} (${cand.ref})</strong>.
                </p>
                <div>
                    <label class="block text-xs font-bold mb-1">Formal Grounds for Disqualification Notice</label>
                    <select class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs border border-outline-variant">
                        <option>Non-Tribal Community Classification</option>
                        <option>Revoked / Cancelled Caste Certificate</option>
                        <option>Simultaneous Double Fellowship Under UGC/CSIR</option>
                        <option>Exceeding Prescribed Age / Eligibility Norms</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex items-center justify-end gap-3">
                <button onclick="closeDisqualifyModal()" class="px-4 py-2 border border-outline rounded-lg text-xs font-semibold">Cancel</button>
                <button onclick="submitDisqualificationNotice()" class="px-5 py-2 bg-error text-on-error rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                    <span class="material-symbols-outlined text-[16px]">assignment_late</span>
                    <span>Issue 15-Day Cure Notice</span>
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeDisqualifyModal() {
    const modal = document.getElementById('disqualify-modal');
    if (modal) modal.classList.add('hidden');
}

function submitDisqualificationNotice() {
    closeDisqualifyModal();
    showToast('Statutory 15-day Defect Notice issued. Scholar notified via SMS & Email.', 'assignment_late', 4000);
}

function openEquityMatrixModal() {
    let modal = document.getElementById('equity-matrix-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'equity-matrix-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-surface-container-lowest text-on-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant flex flex-col max-h-[90vh]">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[24px]">balance</span>
                    <h3 class="font-headline-sm text-headline-sm text-primary font-bold">National Tribal Equity & PVTG Matrix</h3>
                </div>
                <button onclick="closeEquityMatrixModal()" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                <div class="grid grid-cols-3 gap-3">
                    <div class="p-3 bg-surface-container rounded-xl text-center">
                        <div class="text-on-surface-variant">PVTG Representation</div>
                        <div class="text-lg font-bold text-primary mt-1">22.7%</div>
                        <div class="text-[10px] text-secondary font-medium">18,920 Scholars</div>
                    </div>
                    <div class="p-3 bg-surface-container rounded-xl text-center">
                        <div class="text-on-surface-variant">Female Scholars</div>
                        <div class="text-lg font-bold text-primary mt-1">54.1%</div>
                        <div class="text-[10px] text-secondary font-medium">45,168 Scholars</div>
                    </div>
                    <div class="p-3 bg-surface-container rounded-xl text-center">
                        <div class="text-on-surface-variant">Aspirational Districts</div>
                        <div class="text-lg font-bold text-primary mt-1">112 / 112</div>
                        <div class="text-[10px] text-secondary font-medium">100% Saturation</div>
                    </div>
                </div>
                <table class="w-full text-left border border-outline-variant/50 rounded-xl overflow-hidden">
                    <thead class="bg-surface-container text-on-surface font-bold">
                        <tr>
                            <th class="p-2.5">Priority Tribal Group</th>
                            <th class="p-2.5">Focus State</th>
                            <th class="p-2.5">Active Fellows</th>
                            <th class="p-2.5">PFMS Disbursed</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-outline-variant/30">
                        <tr>
                            <td class="p-2.5 font-medium">Birhor & Asur (PVTG)</td>
                            <td class="p-2.5">Jharkhand</td>
                            <td class="p-2.5">412</td>
                            <td class="p-2.5 font-bold text-primary">₹3.84 Cr</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 font-medium">Dongria Kondh & Bondo (PVTG)</td>
                            <td class="p-2.5">Odisha</td>
                            <td class="p-2.5">689</td>
                            <td class="p-2.5 font-bold text-primary">₹6.41 Cr</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 font-medium">Baiga & Kamar (PVTG)</td>
                            <td class="p-2.5">Chhattisgarh / MP</td>
                            <td class="p-2.5">850</td>
                            <td class="p-2.5 font-bold text-primary">₹7.92 Cr</td>
                        </tr>
                        <tr>
                            <td class="p-2.5 font-medium">Santhal & Oraon Major</td>
                            <td class="p-2.5">Eastern Belt</td>
                            <td class="p-2.5">24,190</td>
                            <td class="p-2.5 font-bold text-primary">₹225.40 Cr</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 pt-3 border-t border-outline-variant flex justify-end">
                <button onclick="closeEquityMatrixModal()" class="px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold">Done</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeEquityMatrixModal() {
    const modal = document.getElementById('equity-matrix-modal');
    if (modal) modal.classList.add('hidden');
}

function openBatchAuthorizeModal() {
    let modal = document.getElementById('batch-authorize-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'batch-authorize-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant flex flex-col">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-[24px]">verified</span>
                    <h3 class="font-headline-sm text-headline-sm text-primary font-bold">Batch Authorize DBT Disbursal</h3>
                </div>
                <button onclick="closeBatchAuthorizeModal()" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <div class="space-y-3 text-sm">
                <p class="text-xs">You are about to authorize <strong>Batch #PFMS-2025-BATCH-441</strong> containing:</p>
                <div class="p-3 bg-surface-container rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Total Claims:</strong> 128 Scholars</div>
                    <div><strong>Total Amount:</strong> ₹2.97 Crores</div>
                    <div><strong>Rule 14(b) Cured:</strong> 42 Claims</div>
                    <div><strong>APBS Verified:</strong> 100%</div>
                </div>
                <div class="text-[11px] text-on-surface-variant">
                    By signing, you append your official Section 65B sovereign electronic authorization. Transactions will be immediately dispatched to PFMS DBT gateway.
                </div>
            </div>
            <div class="mt-6 flex items-center justify-end gap-3">
                <button onclick="closeBatchAuthorizeModal()" class="px-4 py-2 border border-outline rounded-lg text-xs font-semibold">Cancel</button>
                <button onclick="confirmBatchAuthorization()" class="px-5 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Sign & Transmit to PFMS</span>
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeBatchAuthorizeModal() {
    const modal = document.getElementById('batch-authorize-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmBatchAuthorization() {
    closeBatchAuthorizeModal();
    const batchId = 'PFMS-BT-' + Math.floor(100000 + Math.random() * 900000);
    showToast(`Batch authorized and dispatched to PFMS! Ref: ${batchId}`, 'task_alt', 5000);
    if (typeof speakText === 'function') {
        speakText('बैच के सभी दावों को पी एफ एम एस हेतु अधिकृत कर दिया गया है।');
    }
}

function toggleNotificationsModal() {
    let drawer = document.getElementById('officer-notifications-drawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'officer-notifications-drawer';
        drawer.className = 'fixed inset-y-0 right-0 z-[9999] w-full max-w-sm bg-surface-container-lowest text-on-surface shadow-2xl border-l border-outline-variant p-5 flex flex-col transition-transform duration-300';
        document.body.appendChild(drawer);
    } else if (!drawer.classList.contains('hidden')) {
        drawer.classList.add('hidden');
        return;
    }

    drawer.innerHTML = `
        <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
                <h3 class="font-headline-sm text-headline-sm text-primary font-bold">System Alerts & Webhooks</h3>
            </div>
            <button onclick="this.closest('#officer-notifications-drawer').classList.add('hidden')" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
                <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 text-xs">
            <div class="p-3 bg-surface-container-low rounded-xl border border-secondary/20">
                <div class="flex items-center gap-1.5 text-secondary font-bold mb-1">
                    <span class="material-symbols-outlined text-[16px]">sync</span>
                    <span>PFMS Disbursal Webhook</span>
                </div>
                <p class="text-on-surface-variant">Tranche H1-2025: ₹51.10 Cr settled across 12,110 Pre-Matric accounts. 0 returned credits.</p>
                <div class="text-[10px] text-outline mt-1">2 mins ago</div>
            </div>
            <div class="p-3 bg-surface-container-low rounded-xl border border-primary/20">
                <div class="flex items-center gap-1.5 text-primary font-bold mb-1">
                    <span class="material-symbols-outlined text-[16px]">verified</span>
                    <span>DigiLocker Bulk Sync</span>
                </div>
                <p class="text-on-surface-variant">Jharkhand Welfare Directorate pushed 482 new caste certificates to the central repository.</p>
                <div class="text-[10px] text-outline mt-1">14 mins ago</div>
            </div>
            <div class="p-3 bg-surface-container-low rounded-xl border border-tertiary/20">
                <div class="flex items-center gap-1.5 text-tertiary font-bold mb-1">
                    <span class="material-symbols-outlined text-[16px]">warning</span>
                    <span>APBS Fallback Notification</span>
                </div>
                <p class="text-on-surface-variant">3 scholars in Sundargarh switched to IPPB doorstep biometric payment due to inactive bank KYC.</p>
                <div class="text-[10px] text-outline mt-1">45 mins ago</div>
            </div>
        </div>
    `;
    drawer.classList.remove('hidden');
}

function verifyCryptographicHash() {
    const hash = '7f8a3b21c44e99015d88019ab921cba3' + Math.floor(1000 + Math.random() * 9000);
    showToast(`Block Hash Verified: ${hash.substring(0, 16)}... [NIC State Node Anchor Match]`, 'verified', 4500);
}

// ==========================================
// 15. PFMS & Ledgers Interactive Controllers
// ==========================================

function triggerPFMSSync() {
    showToast('Connecting to PFMS Core Gateway (pfms.nic.in)...', 'sync', 2000);
    setTimeout(() => {
        showToast('PFMS Live Sync Complete: 14,892 mandates active, 0 unrouted.', 'check_circle', 4000);
    }, 1500);
}

function filterLedgerTab(tab) {
    const rows = document.querySelectorAll('#ledger-table-body tr, .ledger-row');
    rows.forEach(row => {
        if (!tab || tab === 'ALL') {
            row.style.display = '';
        } else if (tab === 'PVTG') {
            const isPvtg = row.textContent.toLowerCase().includes('pvtg') || row.textContent.toLowerCase().includes('birhor') || row.textContent.toLowerCase().includes('baiga');
            row.style.display = isPvtg ? '' : 'none';
        } else if (tab === 'FAILED') {
            const isFailed = row.textContent.toLowerCase().includes('failed') || row.textContent.toLowerCase().includes('rejected') || row.textContent.toLowerCase().includes('action required');
            row.style.display = isFailed ? '' : 'none';
        } else {
            row.style.display = '';
        }
    });
    showToast(`Ledger filtered: ${tab || 'ALL'}`, 'filter_list');
}

function filterLedgerTable() {
    const input = document.getElementById('ledger-search-input') || document.querySelector('input[placeholder*="Search"]');
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    const rows = document.querySelectorAll('#ledger-table-body tr, .ledger-row');
    rows.forEach(row => {
        const text = (row.textContent || '').toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function cureLedgerMandate(id) {
    showToast(`Mandate for ${id || 'Scholar'} re-routed to Aadhaar Payment Bridge (APBS)`, 'verified');
}

function switchLedgerIPPB(id) {
    showToast(`Disbursal for ${id || 'Scholar'} redirected to India Post Payments Bank (Doorstep Biometric)`, 'local_shipping');
}

function paginateLedger(dir) {
    showToast(`Navigated ledger page (${dir > 0 ? 'Next' : 'Previous'})`, 'table_view');
}

function goToLedgerPage(page) {
    showToast(`Navigated to Ledger Page ${page}`, 'table_view');
}

function applyLedgerDeskOverride(id) {
    showToast(`Officer Desk Override applied for ${id || 'Record'}. Logged under Sec 65B.`, 'verified');
}

function filterStateAnalytics(mode) {
    showToast(`Analytics view updated: ${mode}`, 'insights');
}

// ==========================================
// 16. Multilingual Notice Player
// ==========================================

let isAudioPlaying = false;

function toggleNoticeAudioPlayer() {
    const btn = document.getElementById('audio-play-btn');
    const icon = document.getElementById('play-icon');
    
    if (isAudioPlaying) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        isAudioPlaying = false;
        if (icon) icon.textContent = 'play_arrow';
        showToast('Voice guide paused', 'pause');
        return;
    }

    const textToRead = "नमस्ते। आपके छात्रवृत्ति आवेदन में उपनाम की स्पेलिंग में भिन्नता पाई गई है। चिंता न करें। जनजातीय कार्य मंत्रालय के नियम चौदह बी के तहत आपका आवेदन सुरक्षित है। केवल अपने मूल जाति प्रमाण पत्र की एक साफ़ फोटो अपलोड करें।";

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        
        utterance.onend = () => {
            isAudioPlaying = false;
            if (icon) icon.textContent = 'play_arrow';
        };

        utterance.onerror = () => {
            isAudioPlaying = false;
            if (icon) icon.textContent = 'play_arrow';
        };

        window.speechSynthesis.speak(utterance);
        isAudioPlaying = true;
        if (icon) icon.textContent = 'pause';
        showToast('Playing voice explanation in Hindi (हिंदी)...', 'volume_up');
    } else {
        showToast('Text-to-speech is not supported on this browser.', 'warning');
    }
}

// ==========================================
// 17. Hero Search & Alerts Utilities
// ==========================================

function executeHeroSearch() {
    const input = document.getElementById('hero-search-input') || document.querySelector('input[type="text"][placeholder*="Search"]');
    const val = (input ? input.value : '').trim();
    if (!val) {
        showToast('Please enter an Application Reference No, Aadhaar Hash, or Scholar Name', 'search');
        return;
    }
    window.location.href = `/track-cure?ref=${encodeURIComponent(val)}`;
}

function closeHeroSearchPreview() {
    const preview = document.getElementById('search-preview-box');
    if (preview) preview.classList.add('hidden');
}

function sendQuickOTP() {
    showToast('Aadhaar OTP dispatched to registered mobile (9876•••210)', 'sms', 4000);
}

function sendSMSAlert(ref) {
    showToast(`SMS status reminder dispatched to scholar for ref: ${ref || 'MOTA-2025'}`, 'sms');
}

function copyRefNo(ref) {
    const val = ref || 'MOTA-2025-JH-88391';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(val);
    }
    showToast(`Reference ${val} copied to clipboard!`, 'content_copy');
}

// ==========================================
// 18. Image Self-Healing Loader
// ==========================================

function setupImageSelfHealing() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            const currentSrc = this.getAttribute('src') || '';
            if (currentSrc.startsWith('/') && !currentSrc.startsWith('//')) {
                // Try without leading slash
                this.src = currentSrc.substring(1);
            } else if (!currentSrc.startsWith('/') && !currentSrc.startsWith('http') && !currentSrc.startsWith('data:')) {
                // Try with leading slash
                this.src = '/' + currentSrc;
            } else {
                // Fallback to sovereign Ashoka SVG placeholder
                this.src = 'assets/logo.svg';
            }
        }, { once: true });
    });
}



// ==========================================
// 19. Global Inter-Page Fallbacks & Helpers
// ==========================================

function switchLanguage(lang) {
    showToast(`Language set to ${lang === 'hi' ? 'हिन्दी (Hindi)' : lang === 'sat' ? 'संताली (Santali)' : 'English'}`, 'translate');
}

function switchRole(role) {
    showToast(`Switched active role: ${role}`, 'manage_accounts');
}

function switchMode(mode) {
    showToast(`Mode switched: ${mode}`, 'toggle_on');
}

function trackThisApplication(ref) {
    window.location.href = `/track-cure?ref=${encodeURIComponent(ref || 'MOTA-2025-JH-88391')}`;
}

function handleDigiLockerLogin() {
    showToast('Redirecting to MeriPehchan / DigiLocker Sovereign Gateway...', 'verified_user');
    setTimeout(() => window.location.href = '/apply', 1000);
}

function handleParichayLogin() {
    showToast('Authenticating via Parichay (NIC National Single Sign-On)...', 'account_balance');
    setTimeout(() => window.location.href = '/officer', 1000);
}

function handleScholarLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Scholar Identity Verified! Accessing Scholarship Console...', 'verified');
    setTimeout(() => window.location.href = '/apply', 800);
}

function handleOfficerLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Officer Kavach OTP Verified. Opening Scrutiny Console...', 'security');
    setTimeout(() => window.location.href = '/officer', 800);
}

function handleScholarRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Scholar Account Created! Proceeding to Application Wizard...', 'how_to_reg');
    setTimeout(() => window.location.href = '/apply', 800);
}

function handleOfficerRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Officer Enrollment Submitted for Nodal Approval!', 'shield');
    setTimeout(() => window.location.href = '/officer', 800);
}

function refreshKavach() {
    const token = Math.floor(100000 + Math.random() * 900000);
    const kavachEl = document.getElementById('kavachCode');
    if (kavachEl) kavachEl.textContent = token;
    showToast(`Fresh Kavach 2FA Token Generated: ${token}`, 'sync');
}

function autoFillDigiLocker() {
    showToast('Auto-filling verified records from DigiLocker repository...', 'folder_shared');
}

function changeStep(step) {
    showToast(`Wizard step: ${step}`, 'navigation');
}

function clearFormDraft() {
    showToast('Application draft cleared', 'delete');
}

function submitApplication(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Application submitted to MoTA Scrutiny Enclave!', 'task_alt');
}

function submitCure(e) {
    if (e && e.preventDefault) e.preventDefault();
    showToast('Cure document submitted for immediate Tehsildar verification', 'verified');
}

function switchCertificateView(view) {
    showToast(`Certificate view: ${view}`, 'image');
}

function simulateUpload(inputId, previewId) {
    showToast('Document uploaded and scanned for OCR contrast & Rule 14(b)', 'upload_file');
}


// Call the initializer when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if(typeof initGlobalHeader === 'function') initGlobalHeader();
    if(typeof initLandingPage === 'function') initLandingPage();
    if(typeof initAuthPage === 'function') initAuthPage();
    if(typeof initApplyPage === 'function') initApplyPage();
    if(typeof initOfficerPage === 'function') initOfficerPage();
    initButtonWiring();
});

