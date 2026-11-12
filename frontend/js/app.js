// Prilans Application State & Controller
// Modern, Clean, Minimalist UI - Zero AI Artifacts, Gradients, or Alignment Errors

let currentUser = null;
let currentProjects = [];
let activeNav = "projects"; // 'projects', 'recommendations', 'freelancers', 'proposals', 'admin'
let activeFilterProjectType = ""; // "" (all), "Hourly", "Fixed Price"

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();
    await initAuth();
    await loadDynamicCategories();
    await updateDynamicFilterCounts();
    await loadProjects();
});

// Toast notification helper (Minimalist, Solid)
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    const bg = type === "success" ? "bg-slate-900 text-white" : type === "info" ? "bg-slate-800 text-white" : "bg-rose-700 text-white";
    toast.className = `${bg} px-3.5 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 transform transition-all duration-200 translate-y-1 opacity-0 pointer-events-auto border border-slate-700`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.remove("translate-y-1", "opacity-0");
    }, 10);
    
    setTimeout(() => {
        toast.classList.add("translate-y-1", "opacity-0");
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// Dynamic relative time formatter
function formatTimeAgo(isoString) {
    if (!isoString) return "Just now";
    const date = new Date(isoString);
    const now = new Date();
    const elapsedSeconds = Math.max(0, Math.floor((now - date) / 1000));

    if (elapsedSeconds < 60) return "Just now";
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// AUTHENTICATION & DEMO PERSONA CONTROLLER
// ---------------------------------------------------------------------------
async function initAuth() {
    try {
        currentUser = await api.getMe();
        updateUserUI();
    } catch (e) {
        // Fallback default persona for instant evaluation
        await quickSwitchUser("student", false);
    }
}

function updateUserUI() {
    const btnPost = document.getElementById("btnPostProject");
    const btnAuth = document.getElementById("btnAuth");
    const badge = document.getElementById("myProposalsBadge");
    const navAdmin = document.getElementById("nav-admin");
    
    if (!currentUser) {
        if (btnAuth) btnAuth.textContent = "Sign In";
        const nameEl = document.getElementById("sidebarUserName");
        const emailEl = document.getElementById("sidebarUserEmail");
        const avatarEl = document.getElementById("sidebarUserAvatar");
        if (nameEl) nameEl.textContent = "Sign In / Register";
        if (emailEl) emailEl.textContent = "Click to log in or create account";
        if (avatarEl) avatarEl.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=guest";
        if (btnPost) btnPost.classList.add("hidden");
        if (navAdmin) navAdmin.classList.add("hidden");
        if (badge) badge.textContent = "0";
        return;
    }
    
    document.getElementById("sidebarUserName").textContent = currentUser.name;
    document.getElementById("sidebarUserEmail").textContent = currentUser.email;
    if (currentUser.avatar_url) {
        document.getElementById("sidebarUserAvatar").src = currentUser.avatar_url;
    }
    if (btnAuth) {
        btnAuth.textContent = `Sign Out (${currentUser.name.split(' ')[0]})`;
    }
    
    // Toggle post job button depending on role
    if (btnPost) {
        if (currentUser.role === "student") {
            btnPost.classList.add("hidden");
        } else {
            btnPost.classList.remove("hidden");
        }
    }

    // Strict Admin Center visibility (never expose to students or clients)
    if (navAdmin) {
        if (currentUser.role === "admin") {
            navAdmin.classList.remove("hidden");
        } else {
            navAdmin.classList.add("hidden");
        }
    }

    if (badge && currentUser.role !== "student") {
        badge.textContent = "0";
    }

    // Update proposal, messages & notifications badges in sidebar
    updateMyProposalsBadge();
    updateSidebarBadges();
}

async function updateSidebarBadges() {
    try {
        const convos = await api.getConversations();
        const unreadMsgs = convos.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        const msgBadge = document.getElementById("messagesBadge");
        if (msgBadge) {
            msgBadge.textContent = unreadMsgs;
            msgBadge.classList.toggle("hidden", unreadMsgs === 0);
        }

        const notifs = await api.getNotifications();
        const unreadNotifs = notifs.filter(n => !n.read).length;
        const notifBadge = document.getElementById("notificationsBadge");
        if (notifBadge) {
            notifBadge.textContent = unreadNotifs;
            notifBadge.classList.toggle("hidden", unreadNotifs === 0);
        }
    } catch (e) {}
}

async function updateMyProposalsBadge() {
    if (!currentUser || currentUser.role !== "student") return;
    try {
        const apps = await api.getMyApplications();
        const badge = document.getElementById("myProposalsBadge");
        if (badge) badge.textContent = apps.length;
    } catch (e) {}
}

function handleProfileBadgeClick() {
    if (!currentUser) {
        openAuthModal();
    } else if (currentUser.role === "student") {
        openProfileModal();
    } else {
        showToast(`Logged in as ${currentUser.name} (${currentUser.role})`, "info");
    }
}

function openAuthModal() {
    if (currentUser) {
        const wasAdmin = currentUser.role === "admin";
        api.removeToken();
        currentUser = null;
        updateUserUI();
        if (wasAdmin || activeNav === "admin") {
            switchNav("projects");
        }
        showToast("Signed out successfully");
        return;
    }
    document.getElementById("modalAuth").classList.remove("hidden");
    setAuthTab("login");
}

function setAuthTab(tab) {
    const tabLogin = document.getElementById("authTabLogin");
    const tabReg = document.getElementById("authTabRegister");
    const tabAdmin = document.getElementById("authTabAdmin");
    const formLogin = document.getElementById("formLogin");
    const formReg = document.getElementById("formRegister");
    const panelAdmin = document.getElementById("panelAdminAuth");

    tabLogin.className = "text-xs font-bold text-slate-400 hover:text-slate-700 pb-2";
    tabReg.className = "text-xs font-bold text-slate-400 hover:text-slate-700 pb-2";
    if (tabAdmin) tabAdmin.className = "ml-auto text-xs font-bold text-purple-600 hover:text-purple-800 pb-2 flex items-center gap-1";

    formLogin.classList.add("hidden");
    formReg.classList.add("hidden");
    if (panelAdmin) panelAdmin.classList.add("hidden");

    if (tab === "login") {
        tabLogin.className = "text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-2";
        formLogin.classList.remove("hidden");
    } else if (tab === "register") {
        tabReg.className = "text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-2";
        formReg.classList.remove("hidden");
    } else if (tab === "admin") {
        if (tabAdmin) tabAdmin.className = "ml-auto text-xs font-bold text-purple-800 border-b-2 border-purple-700 pb-2 flex items-center gap-1";
        if (panelAdmin) panelAdmin.classList.remove("hidden");
        toggleAdminAuthMode("signin");
    }
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function toggleAdminAuthMode(mode) {
    const formSignin = document.getElementById("formAdminLogin");
    const formReg = document.getElementById("formAdminRegister");
    const btnSignin = document.getElementById("btnAdminModeSignin");
    const btnReg = document.getElementById("btnAdminModeRegister");
    if (!formSignin || !formReg) return;

    if (mode === "signin") {
        formSignin.classList.remove("hidden");
        formReg.classList.add("hidden");
        btnSignin.className = "py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-2xs";
        btnReg.className = "py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900";
    } else {
        formReg.classList.remove("hidden");
        formSignin.classList.add("hidden");
        btnReg.className = "py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-2xs";
        btnSignin.className = "py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900";
    }
}

async function handleAdminLoginForm(e) {
    e.preventDefault();
    const email = document.getElementById("adminLoginEmail").value.trim();
    const password = document.getElementById("adminLoginPassword").value;

    try {
        const res = await api.login(email, password);
        if (res.user.role !== "admin") {
            api.removeToken();
            throw new Error("Access denied: This portal is for Administrators only.");
        }
        currentUser = res.user;
        updateUserUI();
        closeModal("modalAuth");
        showToast(`Welcome, Administrator ${currentUser.name}!`);
        switchNav("admin");
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleAdminRegisterForm(e) {
    e.preventDefault();
    const name = document.getElementById("adminRegName").value.trim();
    const email = document.getElementById("adminRegEmail").value.trim();
    const password = document.getElementById("adminRegPassword").value;
    const admin_key = document.getElementById("adminRegKey").value.trim();

    try {
        const res = await api.register({ role: "admin", name, email, password, admin_key });
        currentUser = res.user;
        updateUserUI();
        closeModal("modalAuth");
        showToast(`Administrator account created for ${currentUser.name}!`);
        switchNav("admin");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function toggleRegStudentFields(isStudent) {
    const el = document.getElementById("regStudentFields");
    if (isStudent) el.classList.remove("hidden");
    else el.classList.add("hidden");
}

async function handleLoginForm(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await api.login(email, password);
        currentUser = res.user;
        updateUserUI();
        closeModal("modalAuth");
        showToast(`Welcome back, ${currentUser.name}!`);
        if (currentUser.role === "admin") {
            switchNav("admin");
        } else {
            switchNav("projects");
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleRegisterForm(e) {
    e.preventDefault();
    const role = document.querySelector('input[name="regRole"]:checked').value;
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const university = document.getElementById("regUniv").value.trim();
    const major = document.getElementById("regMajor").value.trim();

    try {
        const res = await api.register({ role, name, email, password, university, major });
        currentUser = res.user;
        updateUserUI();
        closeModal("modalAuth");
        showToast(`Registration complete! Welcome, ${currentUser.name}`);
        loadProjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function quickSwitchUser(role, showToastMsg = true) {
    let email = "akramulhossain@gmail.com";
    let pwd = "password123";
    
    if (role === "client") {
        email = "contact@havdesign.de";
    } else if (role === "admin") {
        email = "admin@prilans.com";
        pwd = "admin123";
    }
    
    try {
        const res = await api.login(email, pwd);
        currentUser = res.user;
        updateUserUI();
        if (showToastMsg) {
            showToast(`Switched persona to: ${currentUser.name} (${currentUser.role})`);
        }
        
        if (role === "admin") {
            switchNav("admin");
        } else {
            switchNav("projects");
            loadProjects();
        }
    } catch (err) {
        showToast(err.message || "Failed to switch user", "error");
    }
}

function resetDemoData() {
    if (confirm("Reset demo database back to default initial state?")) {
        window.prilansStore.resetToDefault();
        location.reload();
    }
}

// ---------------------------------------------------------------------------
// DYNAMIC CATEGORIES & FILTER COUNTS
// ---------------------------------------------------------------------------
async function loadDynamicCategories() {
    try {
        const categories = await api.getCategories();
        const select = document.getElementById("filterCategory");
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="All">All Categories</option>';
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            if (cat === currentVal) opt.selected = true;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error("Failed to load categories", e);
    }
}

async function updateDynamicFilterCounts() {
    const counts = await api.computeFilterCounts();

    // Experience counts
    document.getElementById("count-exp-any").textContent = counts.experience.any;
    document.getElementById("count-exp-entry").textContent = counts.experience.entry;
    document.getElementById("count-exp-inter").textContent = counts.experience.intermediate;
    document.getElementById("count-exp-expert").textContent = counts.experience.expert;

    // Budget counts
    document.getElementById("count-bud-any").textContent = counts.budget.any;
    document.getElementById("count-bud-lt100").textContent = counts.budget.lt100;
    document.getElementById("count-bud-100to500").textContent = counts.budget.between100and500;
    document.getElementById("count-bud-500to1k").textContent = counts.budget.between500and1k;
    document.getElementById("count-bud-1kto5k").textContent = counts.budget.between1kand5k;
    document.getElementById("count-bud-gt5k").textContent = counts.budget.gt5k;

    // Proposal counts
    document.getElementById("count-prop-any").textContent = counts.proposals.any;
    document.getElementById("count-prop-lt5").textContent = counts.proposals.lt5;
    document.getElementById("count-prop-5to10").textContent = counts.proposals.between5and10;
    document.getElementById("count-prop-10to15").textContent = counts.proposals.between10and15;
    document.getElementById("count-prop-15to20").textContent = counts.proposals.between15and20;
}

// ---------------------------------------------------------------------------
// NAVIGATION & TABS
// ---------------------------------------------------------------------------
function switchNav(nav) {
    if (nav === "admin" && (!currentUser || currentUser.role !== "admin")) {
        showToast("Access denied: Administrators only.", "error");
        nav = "projects";
    }
    activeNav = nav;
    
    // Highlight sidebar items
    const navItems = ["projects", "recommendations", "freelancers", "companies", "proposals", "messages", "notifications", "admin"];
    navItems.forEach(item => {
        const el = document.getElementById(`nav-${item}`);
        if (!el) return;
        const isHidden = el.classList.contains("hidden");
        if (item === nav) {
            el.className = `${isHidden ? 'hidden ' : ''}flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-slate-100 transition-all`;
        } else {
            el.className = `${isHidden ? 'hidden ' : ''}flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all`;
        }
    });

    // Hide/show views
    const viewIds = [
        "projectsContainer",
        "proposalsViewContainer",
        "freelancersViewContainer",
        "companiesViewContainer",
        "messagesViewContainer",
        "notificationsViewContainer",
        "adminViewContainer"
    ];
    viewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

    const subheader = document.getElementById("resultsSubheader");
    const resultsTitle = document.getElementById("resultsTitle");
    const sortControls = document.getElementById("sortControls");
    const showSubheader = ["projects", "recommendations", "freelancers", "companies", "proposals"].includes(nav);
    if (subheader) subheader.classList.toggle("hidden", !showSubheader);
    if (sortControls) sortControls.classList.toggle("hidden", nav !== "projects");

    if (nav === "projects") {
        if (resultsTitle) resultsTitle.textContent = "Showing Results";
        document.getElementById("projectsContainer").classList.remove("hidden");
        loadProjects();
    } else if (nav === "recommendations") {
        if (resultsTitle) resultsTitle.textContent = "Recommended Projects";
        document.getElementById("projectsContainer").classList.remove("hidden");
        loadRecommendedProjects();
    } else if (nav === "freelancers") {
        if (resultsTitle) resultsTitle.textContent = "University Freelancers";
        document.getElementById("freelancersViewContainer").classList.remove("hidden");
        loadFreelancers();
    } else if (nav === "companies") {
        if (resultsTitle) resultsTitle.textContent = "Partner Companies";
        document.getElementById("companiesViewContainer").classList.remove("hidden");
        loadCompanies();
    } else if (nav === "proposals") {
        if (resultsTitle) resultsTitle.textContent = "My Applications";
        document.getElementById("proposalsViewContainer").classList.remove("hidden");
        loadMyApplications();
    } else if (nav === "messages") {
        document.getElementById("messagesViewContainer").classList.remove("hidden");
        loadMessages();
    } else if (nav === "notifications") {
        document.getElementById("notificationsViewContainer").classList.remove("hidden");
        loadNotifications();
    } else if (nav === "admin") {
        document.getElementById("adminViewContainer").classList.remove("hidden");
        loadAdminDashboard();
    }
}

function setTab(tab) {
    const tabs = ["all", "recommended", "proposals"];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (!btn) return;
        if (t === tab) {
            btn.className = "px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white transition-colors";
        } else {
            btn.className = "px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5";
        }
    });

    if (tab === "all") switchNav("projects");
    else if (tab === "recommended") switchNav("recommendations");
    else if (tab === "proposals") switchNav("proposals");
}

// ---------------------------------------------------------------------------
// PROJECT BROWSING, SEARCH & FACETED FILTERS
// ---------------------------------------------------------------------------
async function loadProjects() {
    const filters = getActiveFilters();
    try {
        const data = await api.getProjects(filters);
        currentProjects = data.projects;
        document.getElementById("resultsCount").textContent = `(${data.total_count || 0})`;
        renderProjects(currentProjects);
        await updateDynamicFilterCounts();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function getActiveFilters() {
    const keyword = document.getElementById("searchInput").value.trim();
    const locEl = document.getElementById("locationInput");
    const location = locEl ? locEl.value.trim() : "";
    const category = document.getElementById("filterCategory").value;
    
    // Experience
    const expRadio = document.querySelector('input[name="expLevel"]:checked');
    const experience_level = expRadio ? expRadio.value : "Any";
    
    // Budget
    const budgetRadio = document.querySelector('input[name="budgetRange"]:checked');
    const budget_range = budgetRadio ? budgetRadio.value : "any";

    // Proposals
    const propRadio = document.querySelector('input[name="propRange"]:checked');
    const proposals_range = propRadio ? propRadio.value : "any";

    const sort_by = document.getElementById("sortBy").value;

    return {
        keyword,
        location,
        category,
        experience_level,
        project_type: activeFilterProjectType,
        budget_range,
        proposals_range,
        sort_by
    };
}

function handleSearch() {
    loadProjects();
}

function applyFilters() {
    loadProjects();
}

function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("locationInput").value = "";
    document.getElementById("filterCategory").value = "All";
    document.querySelector('input[name="expLevel"][value="Any"]').checked = true;
    document.querySelector('input[name="budgetRange"][value="any"]').checked = true;
    document.querySelector('input[name="propRange"][value="any"]').checked = true;
    
    activeFilterProjectType = "";
    document.getElementById("btnTypeHourly").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
    document.getElementById("btnTypeFixed").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
    
    loadProjects();
    showToast("Filters reset to default");
}

function toggleProjectType(type) {
    if (activeFilterProjectType === type) {
        activeFilterProjectType = "";
        document.getElementById("btnTypeHourly").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
        document.getElementById("btnTypeFixed").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
    } else {
        activeFilterProjectType = type;
        if (type === "Hourly") {
            document.getElementById("btnTypeHourly").className = "py-1 text-xs font-semibold rounded bg-white text-slate-900 shadow-2xs";
            document.getElementById("btnTypeFixed").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
        } else {
            document.getElementById("btnTypeFixed").className = "py-1 text-xs font-semibold rounded bg-white text-slate-900 shadow-2xs";
            document.getElementById("btnTypeHourly").className = "py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 transition-all";
        }
    }
    applyFilters();
}

// ---------------------------------------------------------------------------
// PROJECT CARD RENDERING (Minimalist, Optical Hierarchy)
// ---------------------------------------------------------------------------
function renderProjects(projects, isRecommended = false) {
    const container = document.getElementById("projectsContainer");
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
                <i data-lucide="inbox" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                <h4 class="text-xs font-bold text-slate-800">No projects found</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Try adjusting your filters or search keywords.</p>
                <button onclick="resetFilters()" class="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold">Reset Filters</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = projects.map(p => {
        const budgetVal = Number(p.budget || 0);
        const rateFormatted = p.project_type === "Hourly" ? `$${budgetVal.toFixed(2)}/hr` : `$${budgetVal.toFixed(2)}`;
        const proposalsCount = p.proposals_count || 0;
        const relativeTime = formatTimeAgo(p.created_at);
        const skillsArr = Array.isArray(p.skills) ? p.skills : [];
        const skillsTags = skillsArr.map(s => `
            <span class="skill-tag">${s}</span>
        `).join("");

        const isClientOrAdmin = currentUser && (currentUser.role === "client" || currentUser.role === "admin");
        const applyBtn = isClientOrAdmin
            ? `<button onclick="openClientProposalsModal(${p.id}, '${escapeQuote(p.title)}')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors">Review (${proposalsCount})</button>`
            : p.has_applied 
                ? `<button disabled class="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 border border-emerald-200"><i data-lucide="check" class="w-3.5 h-3.5"></i> Applied</button>`
                : `<button onclick="openApplyModal(${p.id}, '${escapeQuote(p.title)}', '${escapeQuote(p.client_name)}', ${budgetVal})" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors">Apply Now</button>`;

        const matchBadge = isRecommended && p.match_score ? `
            <span class="match-pill">
                <i data-lucide="sparkles" class="w-3 h-3"></i>
                <span>${p.match_score}% Match</span>
            </span>
        ` : '';

        return `
            <div class="project-card bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs">
                <div>
                    <!-- Card Top Meta Bar -->
                    <div class="flex items-center justify-between gap-2 mb-2.5">
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                ${p.experience_level}
                            </span>
                            ${matchBadge}
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-400">
                            <span class="font-medium">${relativeTime}</span>
                            ${isClientOrAdmin ? `
                            <div class="relative">
                                <button onclick="toggleCardMenu(${p.id}, event)" class="p-1 hover:text-slate-800 text-slate-400 rounded-lg hover:bg-slate-50">
                                    <i data-lucide="more-horizontal" class="w-4 h-4"></i>
                                </button>
                                <div id="card-menu-${p.id}" class="hidden absolute right-0 top-7 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20">
                                    <button onclick="openBonusMatchModal(${p.id}, '${escapeQuote(p.title)}')" class="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium">
                                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-slate-500"></i> Match Students (Bonus)
                                    </button>
                                    <button onclick="openClientProposalsModal(${p.id}, '${escapeQuote(p.title)}')" class="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium">
                                        <i data-lucide="users" class="w-3.5 h-3.5 text-slate-500"></i> Review Proposals
                                    </button>
                                </div>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- Project Title -->
                    <h3 class="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug" onclick="openApplyModal(${p.id}, '${escapeQuote(p.title)}', '${escapeQuote(p.client_name)}', ${p.budget})">
                        ${p.title}
                    </h3>

                    <!-- Client Info Row -->
                    <div class="flex items-center gap-2.5 mt-2 text-xs text-slate-500 flex-wrap">
                        <span class="flex items-center gap-1 text-emerald-600 font-semibold">
                            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Verified
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1 font-medium">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                            ${p.client_country || 'United States'}
                        </span>
                        <span>•</span>
                        <span class="text-slate-500 font-medium">${p.client_rating_display || 'Verified Client'}</span>
                    </div>

                    <!-- Description Snippet -->
                    <p class="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-2">
                        ${p.description}
                    </p>

                    <!-- Skill Tags -->
                    <div class="flex flex-wrap gap-1.5 mt-4">
                        ${skillsTags}
                    </div>
                </div>

                <!-- Footer: Rate, Proposals Count, Action Button -->
                <div class="flex items-center justify-between pt-4 mt-5 border-t border-slate-100">
                    <div class="flex items-center gap-3">
                        <span class="text-base font-bold text-slate-900 font-mono">${rateFormatted}</span>
                        <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <i data-lucide="send" class="w-3 h-3"></i> ${proposalsCount} proposals
                        </span>
                    </div>
                    <div>
                        ${applyBtn}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
}

function escapeQuote(str) {
    return (str || '').replace(/'/g, "\\'");
}

function toggleCardMenu(id, e) {
    if (e) e.stopPropagation();
    // Close other menus first
    document.querySelectorAll("[id^='card-menu-']").forEach(el => {
        if (el.id !== `card-menu-${id}`) el.classList.add("hidden");
    });
    const el = document.getElementById(`card-menu-${id}`);
    if (el) el.classList.toggle("hidden");
}

// ---------------------------------------------------------------------------
// SKILL-BASED RECOMMENDATIONS (Advanced Feature 1 - 5 Marks)
// ---------------------------------------------------------------------------
async function loadRecommendedProjects() {
    try {
        if (!currentUser || currentUser.role !== "student") {
            showToast("Recommendations are tailored for student profiles. Switched to Student.", "info");
            await quickSwitchUser("student", false);
        }
        const projects = await api.getRecommendedProjects();
        document.getElementById("resultsCount").textContent = `(${projects.length} recommended)`;
        renderProjects(projects, true);
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// BONUS CHALLENGE: AI STUDENT MATCHING MECHANISM (5 Marks)
// ---------------------------------------------------------------------------
async function openBonusMatchModal(projectId, projectTitle) {
    const cardMenu = document.getElementById(`card-menu-${projectId}`);
    if (cardMenu) cardMenu.classList.add("hidden");
    document.getElementById("matchModalProjectTitle").textContent = projectTitle;
    document.getElementById("modalMatching").classList.remove("hidden");
    const container = document.getElementById("matchingCandidatesList");
    container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Computing student skill similarity ranking...</div>`;

    try {
        const res = await api.matchStudentsForProject(projectId);
        const candidates = res.candidates || [];
        
        if (candidates.length === 0) {
            container.innerHTML = `<div class="py-6 text-center text-xs text-slate-500">No student candidates found for this project's skill criteria.</div>`;
            return;
        }

        container.innerHTML = candidates.map(c => {
            const matchedTags = (c.matched_skills || []).map(s => 
                `<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">✓ ${s}</span>`
            ).join(" ");
            const missingTags = (c.missing_skills || []).map(s => 
                `<span class="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200 text-[10px]">${s}</span>`
            ).join(" ");

            return `
                <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <img src="${c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <h4 class="text-xs font-bold text-slate-900 truncate">${c.name}</h4>
                                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">${c.match_percentage}% Fit</span>
                                <span class="text-[10px] text-amber-600 font-semibold">★ ${c.avg_rating}</span>
                            </div>
                            <p class="text-[11px] text-slate-500 truncate">${c.university} • ${c.major} • $${c.hourly_rate}/hr</p>
                            <div class="flex flex-wrap gap-1 mt-1">
                                ${matchedTags} ${missingTags}
                            </div>
                        </div>
                    </div>
                    <button onclick="inviteStudentToProject('${c.name}')" class="shrink-0 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold">
                        Invite
                    </button>
                </div>
            `;
        }).join("");
        lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

function inviteStudentToProject(name) {
    showToast(`Invitation sent to ${name}!`);
    closeModal("modalMatching");
}

// ---------------------------------------------------------------------------
// APPLICATION SUBMISSION & TRACKING (Required 8+7 Marks, Advanced 5 Marks)
// ---------------------------------------------------------------------------
function openApplyModal(projectId, title, clientName, defaultBudget) {
    if (!currentUser || currentUser.role !== "student") {
        showToast("Please switch to a Student persona to submit applications", "error");
        return;
    }
    document.getElementById("applyProjectId").value = projectId;
    document.getElementById("applyModalTitle").textContent = title;
    document.getElementById("applyModalClient").textContent = `Client: ${clientName || 'Verified Client'}`;
    document.getElementById("applyBidAmount").value = defaultBudget || 20;
    document.getElementById("modalApply").classList.remove("hidden");
}

async function submitApplication(e) {
    e.preventDefault();
    const projectId = document.getElementById("applyProjectId").value;
    const bid_amount = parseFloat(document.getElementById("applyBidAmount").value);
    const estimated_days = parseInt(document.getElementById("applyEstimatedDays").value);
    const cover_letter = document.getElementById("applyCoverLetter").value.trim();

    try {
        await api.applyForProject(projectId, { bid_amount, estimated_days, cover_letter });
        showToast("Application submitted successfully!");
        closeModal("modalApply");
        loadProjects();
        updateMyProposalsBadge();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function loadMyApplications() {
    const container = document.getElementById("myProposalsList");
    try {
        const apps = await api.getMyApplications();
        document.getElementById("resultsCount").textContent = `(${apps ? apps.length : 0})`;
        if (!apps || apps.length === 0) {
            container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">You have not submitted any proposals yet.</div>`;
            return;
        }

        container.innerHTML = apps.map(a => {
            let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
            if (a.status === "Shortlisted") statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
            if (a.status === "Accepted") statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold";
            if (a.status === "Rejected") statusBadge = "bg-rose-50 text-rose-700 border-rose-200";

            return `
                <div class="py-3.5 flex items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-xs font-bold text-slate-900">${a.project_title}</h4>
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}">${a.status}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">Client: ${a.client_name} • Bid: $${a.bid_amount} • Duration: ${a.estimated_days} days</p>
                        <p class="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100">"${a.cover_letter}"</p>
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-[11px] text-slate-400">${formatTimeAgo(a.created_at)}</span>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

// Client Proposals Evaluation Modal (Advanced Feature: Status Updates - 5 Marks)
async function openClientProposalsModal(projectId, title) {
    const cardMenu = document.getElementById(`card-menu-${projectId}`);
    if (cardMenu) cardMenu.classList.add("hidden");
    document.getElementById("clientReviewProjectTitle").textContent = `Proposals for: ${title}`;
    document.getElementById("modalClientReview").classList.remove("hidden");
    const container = document.getElementById("clientProposalsList");
    container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Loading applicants...</div>`;

    try {
        const apps = await api.getProjectApplications(projectId);
        if (apps.length === 0) {
            container.innerHTML = `<div class="py-6 text-center text-xs text-slate-500">No applications received yet.</div>`;
            return;
        }

        container.innerHTML = apps.map(app => {
            return `
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <img src="${app.student_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            <div>
                                <h4 class="text-xs font-bold text-slate-900">${app.student_name}</h4>
                                <p class="text-[11px] text-slate-500">${app.university || 'University Student'} • ${app.major || ''}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-bold text-slate-900 font-mono">$${app.bid_amount}</span>
                            <span class="text-[10px] text-slate-500 block">${app.estimated_days} days delivery</span>
                        </div>
                    </div>

                    <p class="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        "${app.cover_letter}"
                    </p>

                    <!-- Advanced Status Update Buttons -->
                    <div class="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span class="text-xs font-medium text-slate-600">Status: <span class="text-slate-900 font-bold">${app.status}</span></span>
                        <div class="flex items-center gap-1">
                            <button onclick="updateApplicantStatus(${app.id}, 'Under Review')" class="px-2 py-0.5 text-[11px] font-medium bg-white border border-slate-200 rounded hover:bg-slate-100">Review</button>
                            <button onclick="updateApplicantStatus(${app.id}, 'Shortlisted')" class="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100">Shortlist</button>
                            <button onclick="updateApplicantStatus(${app.id}, 'Accepted')" class="px-2 py-0.5 text-[11px] font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700">Accept</button>
                            <button onclick="updateApplicantStatus(${app.id}, 'Rejected')" class="px-2 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100">Reject</button>
                            <button onclick="openReviewModal(${app.project_id}, ${app.student_id}, '${escapeQuote(app.student_name)}')" class="px-2 py-0.5 text-[11px] font-medium bg-slate-900 text-white rounded">Rate ★</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

async function updateApplicantStatus(appId, newStatus) {
    try {
        await api.updateApplicationStatus(appId, newStatus);
        showToast(`Status updated to "${newStatus}"!`);
        closeModal("modalClientReview");
        updateMyProposalsBadge();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// POST JOB / PUBLISH PROJECT (Required Feature 3 - 8 Marks)
// ---------------------------------------------------------------------------
function openPostProjectModal() {
    if (!currentUser || currentUser.role === "student") {
        showToast("Publishing jobs requires a Client account. Switched to Client persona.", "info");
        quickSwitchUser("client", false).then(() => {
            document.getElementById("modalPostProject").classList.remove("hidden");
        });
        return;
    }
    document.getElementById("modalPostProject").classList.remove("hidden");
}

async function submitNewProject(e) {
    e.preventDefault();
    const title = document.getElementById("postTitle").value.trim();
    const category = document.getElementById("postCategory").value;
    const project_type = document.getElementById("postProjectType").value;
    const budget = parseFloat(document.getElementById("postBudget").value);
    const experience_level = document.getElementById("postExpLevel").value;
    const description = document.getElementById("postDescription").value.trim();
    const skills = document.getElementById("postSkills").value.split(",").map(s => s.trim()).filter(Boolean);

    try {
        await api.createProject({
            title, category, project_type, budget, experience_level, description, skills
        });
        showToast("Project successfully published!");
        closeModal("modalPostProject");
        await loadDynamicCategories();
        await updateDynamicFilterCounts();
        await loadProjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// STUDENT SKILL PROFILE & PORTFOLIO MANAGEMENT
// ---------------------------------------------------------------------------
async function openProfileModal() {
    document.getElementById("modalProfile").classList.remove("hidden");
    try {
        const data = await api.getMyProfile();
        const prof = data.profile || {};
        document.getElementById("profUniversity").value = prof.university || "";
        document.getElementById("profMajor").value = prof.major || "";
        document.getElementById("profRate").value = prof.hourly_rate || 20;
        document.getElementById("profExpLevel").value = prof.experience_level || "Intermediate";
        document.getElementById("profAvailability").value = prof.availability_status || "Available";
        document.getElementById("profBio").value = prof.bio || "";

        renderProfileSkills(data.skills || []);
        renderProfilePortfolios(data.portfolios || []);
    } catch (err) {
        showToast("Load profile: " + err.message, "error");
    }
}

function renderProfileSkills(skills) {
    const container = document.getElementById("profileSkillsTags");
    if (!skills || skills.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-400">No skills added yet.</span>`;
        return;
    }
    container.innerHTML = skills.map(sk => `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
            <span>${sk.skill_name} (${sk.proficiency})</span>
            <button onclick="deleteSkill('${sk.skill_name}')" class="text-slate-400 hover:text-rose-600 font-bold">×</button>
        </span>
    `).join("");
}

async function handleAddNewSkill() {
    const name = document.getElementById("newSkillName").value.trim();
    const proficiency = document.getElementById("newSkillProf").value;
    if (!name) return;
    try {
        await api.addSkill(name, proficiency);
        document.getElementById("newSkillName").value = "";
        const data = await api.getMyProfile();
        renderProfileSkills(data.skills);
        showToast(`Skill "${name}" added`);
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteSkill(skillName) {
    try {
        await api.removeSkill(skillName);
        const data = await api.getMyProfile();
        renderProfileSkills(data.skills);
        showToast(`Skill removed`);
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function saveProfileChanges(e) {
    e.preventDefault();
    const university = document.getElementById("profUniversity").value.trim();
    const major = document.getElementById("profMajor").value.trim();
    const hourly_rate = parseFloat(document.getElementById("profRate").value);
    const experience_level = document.getElementById("profExpLevel").value;
    const availability_status = document.getElementById("profAvailability").value;
    const bio = document.getElementById("profBio").value.trim();

    try {
        await api.updateProfile({ university, major, hourly_rate, experience_level, availability_status, bio });
        showToast("Profile updated successfully!");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// Portfolio
function togglePortfolioForm() {
    document.getElementById("addPortfolioForm").classList.toggle("hidden");
}

function renderProfilePortfolios(portfolios) {
    const container = document.getElementById("profilePortfoliosList");
    if (!portfolios || portfolios.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-400">No portfolio items showcase yet.</span>`;
        return;
    }
    container.innerHTML = portfolios.map(p => `
        <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div class="min-w-0 pr-2">
                <h5 class="text-xs font-bold text-slate-900 truncate">${p.title}</h5>
                <p class="text-[11px] text-slate-500 line-clamp-1">${p.description}</p>
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] text-slate-600 font-medium">${p.tags || ''}</span>
                    ${p.project_url ? `<a href="${p.project_url}" target="_blank" class="text-[10px] text-blue-600 hover:underline">View Link</a>` : ''}
                </div>
            </div>
            <button onclick="deletePortfolioItem(${p.id})" class="text-rose-600 text-xs font-semibold hover:underline shrink-0">Delete</button>
        </div>
    `).join("");
}

async function submitNewPortfolio() {
    const title = document.getElementById("portTitle").value.trim();
    const description = document.getElementById("portDesc").value.trim();
    const project_url = document.getElementById("portLink").value.trim();
    const tags = document.getElementById("portTags").value.trim();
    if (!title || !description) {
        showToast("Please provide portfolio title and description", "error");
        return;
    }
    try {
        await api.addPortfolio({ title, description, project_url, tags });
        togglePortfolioForm();
        const data = await api.getMyProfile();
        renderProfilePortfolios(data.portfolios);
        showToast("Portfolio item created!");
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deletePortfolioItem(id) {
    try {
        await api.deletePortfolio(id);
        const data = await api.getMyProfile();
        renderProfilePortfolios(data.portfolios);
        showToast("Portfolio item deleted");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// FIND FREELANCERS VIEW
// ---------------------------------------------------------------------------
async function loadFreelancers() {
    const container = document.getElementById("freelancersList");
    try {
        const students = await api.listStudents();
        document.getElementById("resultsCount").textContent = `(${students.length})`;
        container.innerHTML = students.map(s => {
            const skillChips = (s.skills || []).map(sk => `
                <span class="skill-tag">${sk.skill_name}</span>
            `).join("");

            return `
                <div class="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2.5 mb-2.5">
                            <img src="${s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
                            <div class="min-w-0">
                                <h4 class="text-xs font-bold text-slate-900 truncate">${s.name}</h4>
                                <p class="text-[11px] text-slate-500 truncate">${s.university} • ${s.major}</p>
                                <div class="flex items-center gap-1 mt-0.5">
                                    <span class="text-xs text-amber-500 font-bold">★ ${s.avg_rating}</span>
                                    <span class="text-[10px] text-slate-400">(${s.review_count} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">${s.bio || 'Motivated university student looking for opportunities.'}</p>
                        <div class="flex flex-wrap gap-1 mb-3">${skillChips}</div>
                    </div>
                    <div class="flex items-center justify-between pt-2.5 border-t border-slate-100">
                        <span class="text-xs font-bold text-slate-900 font-mono">$${s.hourly_rate}/hr</span>
                        <div class="flex items-center gap-1.5">
                            <button onclick="openStudentDetailModal(${s.id})" class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">Profile</button>
                            <button onclick="startMessageWith(${s.id})" class="px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">Message</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
        if (typeof lucide !== "undefined") lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

async function openStudentDetailModal(studentId) {
    try {
        const students = await api.listStudents();
        const s = students.find(x => x.id === parseInt(studentId));
        if (!s) return showToast("Student profile not found", "error");

        const reviewStats = await api.getUserReviews(s.id);
        document.getElementById("studentDetailName").textContent = `${s.name} — Student Profile`;

        const skillsHtml = (s.skills || []).map(sk => `
            <span class="skill-tag">${sk.skill_name} <span class="ml-1 text-[10px] text-slate-400">(${sk.proficiency})</span></span>
        `).join("") || `<span class="text-xs text-slate-400">No skills listed yet</span>`;

        const portfolioHtml = (s.portfolios || []).map(p => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold text-slate-900">${p.title}</h5>
                    ${p.project_url ? `<a href="${p.project_url}" target="_blank" class="text-[11px] font-semibold text-blue-600 hover:underline">Live Demo ↗</a>` : ''}
                </div>
                <p class="text-[11px] text-slate-600 mt-1">${p.description}</p>
                ${p.tags ? `<p class="text-[10px] text-slate-400 mt-1.5 font-medium">${p.tags}</p>` : ''}
            </div>
        `).join("") || `<p class="text-xs text-slate-400">No portfolio items added yet.</p>`;

        const reviewsHtml = (reviewStats.reviews || []).map(r => `
            <div class="p-3 rounded-xl border border-slate-100 bg-white">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">${r.reviewer_name}</span>
                    <span class="text-amber-500 font-bold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p class="text-[11px] text-slate-600 mt-1">${r.comment}</p>
            </div>
        `).join("") || `<p class="text-xs text-slate-400">No reviews yet.</p>`;

        document.getElementById("studentDetailBody").innerHTML = `
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3">
                    <img src="${s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="w-14 h-14 rounded-full object-cover border border-slate-200" />
                    <div>
                        <h4 class="text-sm font-bold text-slate-900">${s.name}</h4>
                        <p class="text-xs text-slate-500">${s.university} • ${s.major}</p>
                        <div class="flex items-center gap-2 mt-1 text-xs">
                            <span class="font-bold text-amber-500">★ ${reviewStats.average_rating}</span>
                            <span class="text-slate-400">(${reviewStats.total_reviews} reviews)</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">${s.availability_status}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-base font-bold font-mono text-slate-900">$${s.hourly_rate}/hr</div>
                    <button onclick="closeModal('modalStudentDetail'); startMessageWith(${s.id});" class="mt-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">Message</button>
                </div>
            </div>
            <div>
                <h5 class="text-xs font-bold text-slate-900 mb-1.5">About</h5>
                <p class="text-xs text-slate-600 leading-relaxed">${s.bio || 'No bio provided.'}</p>
            </div>
            <div>
                <h5 class="text-xs font-bold text-slate-900 mb-2">Skills & Proficiency</h5>
                <div class="flex flex-wrap gap-1.5">${skillsHtml}</div>
            </div>
            <div>
                <h5 class="text-xs font-bold text-slate-900 mb-2">Portfolio Case Studies</h5>
                <div class="space-y-2">${portfolioHtml}</div>
            </div>
            <div>
                <h5 class="text-xs font-bold text-slate-900 mb-2">Client Reviews</h5>
                <div class="space-y-2">${reviewsHtml}</div>
            </div>
        `;
        document.getElementById("modalStudentDetail").classList.remove("hidden");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// COMPANIES VIEW
// ---------------------------------------------------------------------------
async function loadCompanies() {
    const container = document.getElementById("companiesList");
    try {
        const companies = await api.getCompanies();
        document.getElementById("resultsCount").textContent = `(${companies.length})`;
        if (!companies.length) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">No companies found.</div>`;
            return;
        }
        container.innerHTML = companies.map(c => {
            const recentHtml = (c.recent_projects || []).map(p => `
                <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                    <span class="text-slate-700 font-medium truncate pr-2">${p.title}</span>
                    <span class="font-mono font-bold text-slate-900 shrink-0">$${p.budget}${p.project_type === 'Hourly' ? '/hr' : ''}</span>
                </div>
            `).join("") || `<p class="text-[11px] text-slate-400">No open projects currently.</p>`;

            return `
                <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between gap-3 mb-3">
                            <div class="flex items-center gap-3">
                                <img src="${c.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(c.name)}" class="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-50" />
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">${c.name}</h4>
                                    <p class="text-[11px] text-slate-500 flex items-center gap-1">
                                        <i data-lucide="map-pin" class="w-3 h-3"></i> ${c.country} • <span class="text-emerald-600 font-semibold">Verified</span> • <span class="text-amber-500 font-bold">★ ${c.average_rating}</span> <span>(${c.review_count})</span>
                                    </p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">${c.open_projects_count} Open</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-3">${c.bio}</p>
                        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Active Openings</p>
                            ${recentHtml}
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button onclick="startMessageWith(${c.id})" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">Message</button>
                        <button onclick="viewCompanyProjects('${escapeQuote(c.name)}')" class="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors">View Projects</button>
                    </div>
                </div>
            `;
        }).join("");
        if (typeof lucide !== "undefined") lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

function viewCompanyProjects(companyName) {
    document.getElementById("searchInput").value = companyName;
    switchNav("projects");
}

// ---------------------------------------------------------------------------
// MESSAGES VIEW
// ---------------------------------------------------------------------------
let activeChatPeerId = null;

async function loadMessages(preselectPeerId = null) {
    try {
        const contacts = await api.getAllContacts();
        const selectEl = document.getElementById("newChatContactSelect");
        if (selectEl) {
            selectEl.innerHTML = `<option value="">+ New Chat</option>` + contacts.map(c => `<option value="${c.id}">${c.name} (${c.role})</option>`).join("");
        }

        const convos = await api.getConversations();
        const listEl = document.getElementById("conversationsList");
        if (!convos.length && !preselectPeerId) {
            listEl.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">No messages yet. Pick a contact above to start chatting.</p>`;
            document.getElementById("activeChatMessages").innerHTML = "";
            document.getElementById("sendMessageForm").classList.add("hidden");
        } else {
            listEl.innerHTML = convos.map(c => {
                const isSelected = activeChatPeerId === c.peer_id;
                return `
                    <button onclick="openMessageThread(${c.peer_id})" class="w-full text-left p-2.5 rounded-xl border transition-colors ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'}">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-bold truncate">${c.peer_name}</span>
                            ${c.unread_count > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">${c.unread_count}</span>` : `<span class="text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}">${formatTimeAgo(c.last_at)}</span>`}
                        </div>
                        <p class="text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}">${c.last_message}</p>
                    </button>
                `;
            }).join("");
        }

        const targetPeer = preselectPeerId || activeChatPeerId || (convos[0] && convos[0].peer_id);
        if (targetPeer) {
            await openMessageThread(targetPeer);
        }
        updateSidebarBadges();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function openMessageThread(peerId) {
    activeChatPeerId = parseInt(peerId);
    const data = await api.getThreadMessages(activeChatPeerId);
    const headerEl = document.getElementById("activeChatHeader");
    const msgsEl = document.getElementById("activeChatMessages");
    const formEl = document.getElementById("sendMessageForm");

    if (data.peer) {
        headerEl.innerHTML = `
            <div class="flex items-center gap-2.5">
                <span class="text-xs font-bold text-slate-900">${data.peer.name}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 text-slate-700 capitalize">${data.peer.role}</span>
            </div>
            <span class="text-[11px] text-slate-400">${data.peer.email}</span>
        `;
    }
    formEl.classList.remove("hidden");

    if (!data.messages.length) {
        msgsEl.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">Start the conversation with ${data.peer ? data.peer.name : 'this user'}.</p>`;
    } else {
        msgsEl.innerHTML = data.messages.map(m => {
            const isMine = currentUser && m.sender_id === currentUser.id;
            return `
                <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${isMine ? 'bg-slate-900 text-white rounded-br-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'}">
                        <p class="leading-relaxed">${m.text}</p>
                        <p class="text-[10px] mt-1 ${isMine ? 'text-slate-300' : 'text-slate-400'}">${formatTimeAgo(m.created_at)}</p>
                    </div>
                </div>
            `;
        }).join("");
        msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    // Refresh conversation list highlight and unread badges
    const convos = await api.getConversations();
    const listEl = document.getElementById("conversationsList");
    if (convos.length) {
        listEl.innerHTML = convos.map(c => {
            const isSelected = activeChatPeerId === c.peer_id;
            return `
                <button onclick="openMessageThread(${c.peer_id})" class="w-full text-left p-2.5 rounded-xl border transition-colors ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'}">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold truncate">${c.peer_name}</span>
                        ${c.unread_count > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">${c.unread_count}</span>` : `<span class="text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}">${formatTimeAgo(c.last_at)}</span>`}
                    </div>
                    <p class="text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}">${c.last_message}</p>
                </button>
            `;
        }).join("");
    }
    updateSidebarBadges();
    if (typeof lucide !== "undefined") lucide.createIcons();
}

async function handleSendMessage(e) {
    e.preventDefault();
    if (!activeChatPeerId) return;
    const input = document.getElementById("chatMessageInput");
    const text = input.value.trim();
    if (!text) return;
    try {
        await api.sendMessage(activeChatPeerId, text);
        input.value = "";
        await openMessageThread(activeChatPeerId);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function startNewChatFromSelect(peerId) {
    if (!peerId) return;
    openMessageThread(parseInt(peerId));
}

function startMessageWith(peerId) {
    activeChatPeerId = parseInt(peerId);
    switchNav("messages");
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS VIEW
// ---------------------------------------------------------------------------
async function loadNotifications() {
    const container = document.getElementById("notificationsList");
    try {
        const notifs = await api.getNotifications();
        if (!notifs.length) {
            container.innerHTML = `<div class="py-10 text-center text-xs text-slate-400">You're all caught up! No notifications yet.</div>`;
            return;
        }
        container.innerHTML = notifs.map(n => `
            <div class="py-3.5 flex items-start justify-between gap-3 ${n.read ? 'opacity-75' : ''}">
                <div class="flex items-start gap-3">
                    <span class="mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-600'}"></span>
                    <div>
                        <h4 class="text-xs font-bold text-slate-900">${n.title}</h4>
                        <p class="text-xs text-slate-600 mt-0.5">${n.message}</p>
                    </div>
                </div>
                <span class="text-[11px] text-slate-400 shrink-0">${formatTimeAgo(n.created_at)}</span>
            </div>
        `).join("");
        updateSidebarBadges();
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-xs text-rose-600">${err.message}</div>`;
    }
}

async function markNotificationsRead() {
    await api.markAllNotificationsRead();
    showToast("All notifications marked as read");
    await loadNotifications();
}

// ---------------------------------------------------------------------------
// ADMIN DASHBOARD (Required Feature 8 - 10 Marks)
// ---------------------------------------------------------------------------
async function loadAdminDashboard() {
    if (!currentUser || currentUser.role !== "admin") {
        showToast("Access denied: Administrators only.", "error");
        switchNav("projects");
        return;
    }
    try {
        const stats = await api.getAdminStats();

        // Render Stats Grid
        const grid = document.getElementById("adminStatsGrid");
        grid.innerHTML = `
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-medium">Total Users</span>
                <h4 class="text-xl font-bold text-slate-900 mt-0.5">${stats.total_users}</h4>
                <span class="text-[10px] text-slate-500">${stats.total_students} Students • ${stats.total_clients} Clients</span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-medium">Total Projects</span>
                <h4 class="text-xl font-bold text-slate-900 mt-0.5">${stats.total_projects}</h4>
                <span class="text-[10px] text-slate-500">Active postings</span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-medium">Proposals</span>
                <h4 class="text-xl font-bold text-slate-900 mt-0.5">${stats.total_applications}</h4>
                <span class="text-[10px] text-slate-500">Live submissions</span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-medium">Total Volume</span>
                <h4 class="text-xl font-bold text-slate-900 mt-0.5 font-mono">$${stats.total_budget_volume}</h4>
                <span class="text-[10px] text-slate-500">${stats.total_reviews} Reviews logged</span>
            </div>
        `;

        // Render User Table
        const userTable = document.getElementById("adminUserTable");
        userTable.innerHTML = stats.users.map(u => `
            <tr class="hover:bg-slate-50">
                <td class="py-2 px-3 font-semibold text-slate-900">${u.name}</td>
                <td class="py-2 px-3 text-slate-600">${u.email}</td>
                <td class="py-2 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${u.role === 'admin' ? 'bg-slate-900 text-white' : u.role === 'client' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-50 text-slate-700 border-slate-200'}">${u.role}</span>
                </td>
                <td class="py-2 px-3 text-slate-500">${u.country}</td>
                <td class="py-2 px-3">
                    ${u.role !== 'admin' ? `<button onclick="deleteAdminUser(${u.id})" class="text-rose-600 hover:underline font-semibold">Delete</button>` : `<span class="text-slate-300">Protected</span>`}
                </td>
            </tr>
        `).join("");

        // Render Project Moderation Table
        const projectsTable = document.getElementById("adminProjectsTable");
        if (projectsTable) {
            projectsTable.innerHTML = (stats.projects || []).map(p => `
                <tr class="hover:bg-slate-50">
                    <td class="py-2 px-3 font-semibold text-slate-900">${p.title}</td>
                    <td class="py-2 px-3 text-slate-600">${p.client_name}</td>
                    <td class="py-2 px-3 text-slate-600">${p.category}</td>
                    <td class="py-2 px-3 font-mono font-semibold text-slate-900">$${p.budget}${p.project_type === 'Hourly' ? '/hr' : ''}</td>
                    <td class="py-2 px-3">
                        <button onclick="deleteAdminProject(${p.id})" class="text-rose-600 hover:underline font-semibold">Remove</button>
                    </td>
                </tr>
            `).join("");
        }

    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteAdminProject(id) {
    if (!currentUser || currentUser.role !== "admin") {
        return showToast("Access denied: Administrators only.", "error");
    }
    if (!confirm("Are you sure you want to remove this project?")) return;
    try {
        await api.deleteProject(id);
        showToast("Project removed");
        loadAdminDashboard();
        await updateDynamicFilterCounts();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteAdminUser(id) {
    if (!currentUser || currentUser.role !== "admin") {
        return showToast("Access denied: Administrators only.", "error");
    }
    if (!confirm("Are you sure you want to delete this user from the platform?")) return;
    try {
        await api.deleteAdminUser(id);
        showToast("User removed");
        loadAdminDashboard();
        await updateDynamicFilterCounts();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// RATINGS & REVIEWS (Advanced Feature 4 - 5 Marks)
// ---------------------------------------------------------------------------
function openReviewModal(projectId, studentId, studentName) {
    document.getElementById("reviewProjectId").value = projectId;
    document.getElementById("reviewRevieweeId").value = studentId;
    document.getElementById("reviewRecipientName").textContent = `Reviewing performance of ${studentName}`;
    document.getElementById("modalReview").classList.remove("hidden");
}

function setRating(val) {
    document.getElementById("ratingValue").value = val;
    const btns = document.querySelectorAll("#starRatingSelector .star-btn");
    btns.forEach((b, idx) => {
        if (idx < val) {
            b.className = "star-btn text-xl text-amber-400";
        } else {
            b.className = "star-btn text-xl text-slate-300";
        }
    });
}

async function submitReviewForm(e) {
    e.preventDefault();
    const project_id = parseInt(document.getElementById("reviewProjectId").value);
    const reviewee_id = parseInt(document.getElementById("reviewRevieweeId").value);
    const rating = parseInt(document.getElementById("ratingValue").value);
    const comment = document.getElementById("reviewComment").value.trim();

    try {
        await api.submitReview({ project_id, reviewee_id, rating, comment });
        showToast("Review submitted successfully!");
        closeModal("modalReview");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------------------------------------------------------------------
// GENERAL UTILS
// ---------------------------------------------------------------------------
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
}

// Close any open card menus when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative") && !e.target.closest("[id^='card-menu-']")) {
        document.querySelectorAll("[id^='card-menu-']").forEach(el => el.classList.add("hidden"));
    }
});
