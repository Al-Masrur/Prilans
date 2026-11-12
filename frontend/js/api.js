// Universal API Adapter for Prilans
// Backed by PrilansStore for 100% free Vercel deployment with zero database maintenance.

const api = {
    store: window.prilansStore,

    // Token & Auth session
    getToken() {
        return localStorage.getItem("prilans_token");
    },
    setToken(token) {
        localStorage.setItem("prilans_token", token);
    },
    removeToken() {
        localStorage.removeItem("prilans_token");
        localStorage.removeItem("prilans_user_id");
    },
    getUserId() {
        const id = localStorage.getItem("prilans_user_id");
        return id ? parseInt(id) : null;
    },
    setUserId(id) {
        localStorage.setItem("prilans_user_id", id);
    },

    // Auth
    async login(email, password) {
        const user = this.store.login(email, password);
        const token = "token_" + user.id + "_" + Date.now();
        this.setToken(token);
        this.setUserId(user.id);
        return { access_token: token, user };
    },

    async register(userData) {
        const user = this.store.register(userData);
        const token = "token_" + user.id + "_" + Date.now();
        this.setToken(token);
        this.setUserId(user.id);
        return { access_token: token, user };
    },

    async getMe() {
        const uid = this.getUserId();
        if (!uid) throw new Error("Not authenticated");
        const user = this.store.findUserById(uid);
        if (!user) throw new Error("User not found");
        return user;
    },

    // Projects
    async getProjects(filters = {}) {
        const uid = this.getUserId();
        return this.store.getProjects(filters, uid);
    },

    async computeFilterCounts() {
        return this.store.computeFilterCounts();
    },

    async createProject(projectData) {
        const user = await this.getMe();
        if (user.role === "student") {
            throw new Error("Only clients can post projects");
        }
        return this.store.createProject(user, projectData);
    },

    async deleteProject(id) {
        return this.store.deleteProject(id);
    },

    // Applications
    async applyForProject(projectId, applicationData) {
        const user = await this.getMe();
        if (user.role !== "student") {
            throw new Error("Only students can apply for projects");
        }
        return this.store.applyForProject(user, projectId, applicationData);
    },

    async getMyApplications() {
        const uid = this.getUserId();
        if (!uid) return [];
        return this.store.getMyApplications(uid);
    },

    async getProjectApplications(projectId) {
        return this.store.getProjectApplications(projectId);
    },

    async updateApplicationStatus(applicationId, status) {
        return this.store.updateApplicationStatus(applicationId, status);
    },

    // Student Profile & Skills
    async getMyProfile() {
        const user = await this.getMe();
        return {
            user,
            profile: user.profile || {},
            skills: user.skills || [],
            portfolios: user.portfolios || []
        };
    },

    async updateProfile(profileData) {
        const uid = this.getUserId();
        return this.store.updateProfile(uid, profileData);
    },

    async addSkill(skill_name, proficiency) {
        const uid = this.getUserId();
        return this.store.addSkill(uid, skill_name, proficiency);
    },

    async removeSkill(skill_name) {
        const uid = this.getUserId();
        return this.store.removeSkill(uid, skill_name);
    },

    async addPortfolio(portfolioData) {
        const uid = this.getUserId();
        return this.store.addPortfolio(uid, portfolioData);
    },

    async deletePortfolio(id) {
        const uid = this.getUserId();
        return this.store.deletePortfolio(uid, id);
    },

    async listStudents(params = {}) {
        return this.store.listStudents(params);
    },

    // Recommendations & Matching Engine
    async getRecommendedProjects() {
        const uid = this.getUserId();
        return this.store.recommendProjectsForStudent(uid);
    },

    async matchStudentsForProject(projectId) {
        const candidates = this.store.matchStudentsForProject(projectId);
        return {
            project_id: projectId,
            total_matched: candidates.length,
            candidates
        };
    },

    // Reviews
    async submitReview(reviewData) {
        const user = await this.getMe();
        return this.store.addReview(user, reviewData);
    },

    async getUserReviews(userId) {
        return this.store.getUserReviewStats(userId);
    },

    // Admin
    async getAdminStats() {
        return this.store.getAdminStats();
    },

    async deleteAdminUser(id) {
        return this.store.deleteUser(id);
    }
};
