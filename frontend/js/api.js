// API Client for Prilans
const API_BASE = window.location.origin + "/api";

const api = {
    getToken() {
        return localStorage.getItem("prilans_token");
    },
    setToken(token) {
        localStorage.setItem("prilans_token", token);
    },
    removeToken() {
        localStorage.removeItem("prilans_token");
        localStorage.removeItem("prilans_user");
    },
    getUser() {
        const u = localStorage.getItem("prilans_user");
        return u ? JSON.parse(u) : null;
    },
    setUser(user) {
        localStorage.setItem("prilans_user", JSON.stringify(user));
    },

    async request(endpoint, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };
        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (res.status === 401) {
            // Token expired or invalid
            console.warn("Session expired or unauthorized");
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.detail || `Request failed with status ${res.status}`);
        }
        return data;
    },

    // Auth
    async login(email, password) {
        const data = await this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
    },

    async register(userData) {
        const data = await this.request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
    },

    async getMe() {
        const data = await this.request("/auth/me");
        this.setUser(data);
        return data;
    },

    // Projects
    async getProjects(filters = {}) {
        const params = new URLSearchParams();
        if (filters.keyword) params.append("keyword", filters.keyword);
        if (filters.category && filters.category !== "All") params.append("category", filters.category);
        if (filters.experience_level && filters.experience_level !== "Any") params.append("experience_level", filters.experience_level);
        if (filters.project_type) params.append("project_type", filters.project_type);
        if (filters.budget_range && filters.budget_range !== "any") params.append("budget_range", filters.budget_range);
        if (filters.proposals_range && filters.proposals_range !== "any") params.append("proposals_range", filters.proposals_range);
        if (filters.sort_by) params.append("sort_by", filters.sort_by);

        return await this.request(`/projects/?${params.toString()}`);
    },

    async getProjectDetails(id) {
        return await this.request(`/projects/${id}`);
    },

    async createProject(projectData) {
        return await this.request("/projects/", {
            method: "POST",
            body: JSON.stringify(projectData)
        });
    },

    async deleteProject(id) {
        return await this.request(`/projects/${id}`, {
            method: "DELETE"
        });
    },

    // Applications
    async applyForProject(projectId, applicationData) {
        return await this.request(`/applications/projects/${projectId}/apply`, {
            method: "POST",
            body: JSON.stringify(applicationData)
        });
    },

    async getMyApplications() {
        return await this.request("/applications/my");
    },

    async getProjectApplications(projectId) {
        return await this.request(`/applications/projects/${projectId}`);
    },

    async updateApplicationStatus(applicationId, status) {
        return await this.request(`/applications/${applicationId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status })
        });
    },

    // Student Profile & Skills
    async getMyProfile() {
        return await this.request("/students/profile");
    },

    async updateProfile(profileData) {
        return await this.request("/students/profile", {
            method: "PUT",
            body: JSON.stringify(profileData)
        });
    },

    async addSkill(skill_name, proficiency) {
        return await this.request("/students/skills", {
            method: "POST",
            body: JSON.stringify({ skill_name, proficiency })
        });
    },

    async removeSkill(skill_name) {
        return await this.request(`/students/skills/${encodeURIComponent(skill_name)}`, {
            method: "DELETE"
        });
    },

    async addPortfolio(portfolioData) {
        return await this.request("/students/portfolio", {
            method: "POST",
            body: JSON.stringify(portfolioData)
        });
    },

    async deletePortfolio(id) {
        return await this.request(`/students/portfolio/${id}`, {
            method: "DELETE"
        });
    },

    async listStudents(params = {}) {
        const q = new URLSearchParams(params).toString();
        return await this.request(`/students/?${q}`);
    },

    // Recommendations & Matching Engine
    async getRecommendedProjects() {
        return await this.request("/recommendations/projects");
    },

    async matchStudentsForProject(projectId) {
        return await this.request(`/recommendations/match-students/${projectId}`);
    },

    // Reviews
    async submitReview(reviewData) {
        return await this.request("/reviews/", {
            method: "POST",
            body: JSON.stringify(reviewData)
        });
    },

    async getUserReviews(userId) {
        return await this.request(`/reviews/user/${userId}`);
    },

    // Admin
    async getAdminStats() {
        return await this.request("/admin/stats");
    },

    async getAdminUsers() {
        return await this.request("/admin/users");
    },

    async deleteAdminUser(id) {
        return await this.request(`/admin/users/${id}`, {
            method: "DELETE"
        });
    },

    async getAdminProjects() {
        return await this.request("/admin/projects");
    }
};
