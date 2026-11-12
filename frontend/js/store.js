// Prilans Dynamic Universal Store (Free, Persistent, Vercel-Ready)
// Manages live reactive database with zero hardcoding and automatic persistence.

const STORAGE_KEY = "prilans_db_v2";

class PrilansStore {
    constructor() {
        this.load();
    }

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try {
                this.db = JSON.parse(data);
                return;
            } catch (e) {
                console.error("Failed to parse storage, reinitializing", e);
            }
        }
        this.initializeDefaultData();
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    }

    resetToDefault() {
        localStorage.removeItem(STORAGE_KEY);
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        const now = Date.now();
        const mins = (m) => new Date(now - m * 60 * 1000).toISOString();
        const hours = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

        this.db = {
            users: [
                {
                    id: 1,
                    name: "Akramul Hossain Shiblu",
                    email: "akramulhossain@gmail.com",
                    password: "password123",
                    role: "student",
                    country: "Bangladesh",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(48),
                    profile: {
                        university: "University of Engineering & Technology",
                        major: "Computer Science & Engineering",
                        bio: "Frontend developer and creative UI/UX designer with 2+ years of hands-on experience in WordPress, Figma, and modern web applications.",
                        hourly_rate: 25.0,
                        experience_level: "Intermediate",
                        availability_status: "Available",
                        github_url: "https://github.com/shiblu",
                        portfolio_url: "https://shiblu.design"
                    },
                    skills: [
                        { skill_name: "UI Design", proficiency: "Expert" },
                        { skill_name: "Web Design", proficiency: "Expert" },
                        { skill_name: "Landing Page", proficiency: "Expert" },
                        { skill_name: "Web Development", proficiency: "Intermediate" },
                        { skill_name: "WordPress", proficiency: "Intermediate" },
                        { skill_name: "Figma", proficiency: "Expert" },
                        { skill_name: "Responsive Design", proficiency: "Expert" }
                    ],
                    portfolios: [
                        {
                            id: 1,
                            title: "FinTech Mobile & Web Dashboard",
                            description: "A modern banking dashboard with dark mode, transaction graphs, and multi-currency support designed in Figma.",
                            project_url: "https://fintech-mockup.prilans.test",
                            image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
                            tags: "Figma, UI/UX, Dashboard"
                        },
                        {
                            id: 2,
                            title: "Clean Organic Brand E-Commerce Store",
                            description: "High-converting Shopify/WordPress storefront with responsive layout and speed optimization.",
                            project_url: "https://organic-demo.prilans.test",
                            image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
                            tags: "WordPress, Responsive Design, E-Commerce"
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Sarah Jenkins",
                    email: "sarah.j@mit.edu",
                    password: "password123",
                    role: "student",
                    country: "United States",
                    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(72),
                    profile: {
                        university: "MIT",
                        major: "Software Systems",
                        bio: "Full stack Python and React enthusiast. Built numerous academic and client projects.",
                        hourly_rate: 35.0,
                        experience_level: "Expert",
                        availability_status: "Available",
                        github_url: "https://github.com/sarahj",
                        portfolio_url: "https://sarahj.dev"
                    },
                    skills: [
                        { skill_name: "Python", proficiency: "Expert" },
                        { skill_name: "FastAPI", proficiency: "Expert" },
                        { skill_name: "React", proficiency: "Expert" },
                        { skill_name: "SQL", proficiency: "Intermediate" },
                        { skill_name: "Docker", proficiency: "Intermediate" }
                    ],
                    portfolios: []
                },
                {
                    id: 3,
                    name: "Alexandre Moreau",
                    email: "alex.m@sorbonne.fr",
                    password: "password123",
                    role: "student",
                    country: "Germany",
                    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(96),
                    profile: {
                        university: "Technical University of Munich",
                        major: "Informatics",
                        bio: "Junior web developer focusing on responsive landing pages and WordPress themes.",
                        hourly_rate: 18.0,
                        experience_level: "Entry Level",
                        availability_status: "Available",
                        github_url: "https://github.com/alexm",
                        portfolio_url: "https://alexm.io"
                    },
                    skills: [
                        { skill_name: "Web Design", proficiency: "Intermediate" },
                        { skill_name: "WordPress", proficiency: "Intermediate" },
                        { skill_name: "HTML/CSS", proficiency: "Expert" },
                        { skill_name: "JavaScript", proficiency: "Beginner" }
                    ],
                    portfolios: []
                },
                {
                    id: 4,
                    name: "HAV Design Studio",
                    email: "contact@havdesign.de",
                    password: "password123",
                    role: "client",
                    country: "Germany",
                    avatar_url: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(120)
                },
                {
                    id: 5,
                    name: "EduCourse Global",
                    email: "support@educourse.org",
                    password: "password123",
                    role: "client",
                    country: "United States",
                    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(140)
                },
                {
                    id: 6,
                    name: "Bengal Digital Media",
                    email: "hello@bengaldigital.com",
                    password: "password123",
                    role: "client",
                    country: "Bangladesh",
                    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(160)
                },
                {
                    id: 7,
                    name: "Maple Apex Solutions",
                    email: "projects@mapleapex.ca",
                    password: "password123",
                    role: "client",
                    country: "Canada",
                    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(180)
                },
                {
                    id: 8,
                    name: "Platform Administrator",
                    email: "admin@prilans.com",
                    password: "admin123",
                    role: "admin",
                    country: "United States",
                    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80",
                    created_at: hours(200)
                }
            ],
            projects: [
                {
                    id: 1,
                    client_id: 4,
                    client_name: "HAV Design Studio",
                    client_country: "Germany",
                    title: "Let's Collaborate on HAV's Website Redesign",
                    description: "We are looking for a creative person who can redesign & build beautiful landing pages in WordPress sites. Must be skilled in creating clean, fast-loading visual components.",
                    category: "Web Design",
                    project_type: "Hourly",
                    budget: 15.0,
                    experience_level: "Entry Level",
                    location: "Germany",
                    skills: ["UI Design", "Web Design", "Landing Page", "Web Development", "WordPress"],
                    created_at: mins(15),
                    status: "open"
                },
                {
                    id: 2,
                    client_id: 5,
                    client_name: "EduCourse Global",
                    client_country: "United States",
                    title: "Build/Edit Landing Page for Online Course",
                    description: "Have a current landing page for my website/course (about). Can either edit that one for my new course or make a new one. Looking for modern visual aesthetics and clear call-to-actions.",
                    category: "Web Design",
                    project_type: "Hourly",
                    budget: 20.0,
                    experience_level: "Entry Level",
                    location: "United States",
                    skills: ["Website Redesign", "Web Design", "Landing Page", "Graphic Design", "Logo Design", "UI/UX"],
                    created_at: mins(20),
                    status: "open"
                },
                {
                    id: 3,
                    client_id: 6,
                    client_name: "Bengal Digital Media",
                    client_country: "Bangladesh",
                    title: "Web Designer for E-Commerce Website",
                    description: "Install new e-commerce responsive WordPress theme. Redesign menu, layout and create pages and posts for a lifestyle and clothing brand.",
                    category: "Web Development",
                    project_type: "Hourly",
                    budget: 25.0,
                    experience_level: "Intermediate",
                    location: "Bangladesh",
                    skills: ["Web Design", "Responsive Design", "Web Development", "WordPress"],
                    created_at: mins(25),
                    status: "open"
                },
                {
                    id: 4,
                    client_id: 7,
                    client_name: "Maple Apex Solutions",
                    client_country: "Canada",
                    title: "Website Designer",
                    description: "We're looking for a website designer who can help us redesign our company website, we prefer based designs using Figma with comprehensive brand design systems.",
                    category: "Web Design",
                    project_type: "Hourly",
                    budget: 50.0,
                    experience_level: "Expert",
                    location: "Canada",
                    skills: ["Web Design", "Adobe Photoshop", "Figma", "Prototyping", "Logo Design"],
                    created_at: mins(33),
                    status: "open"
                },
                {
                    id: 5,
                    client_id: 5,
                    client_name: "EduCourse Global",
                    client_country: "United States",
                    title: "Build Student Assessment Portal with Python & React",
                    description: "Looking for a motivated university student to develop an interactive quiz and assessment portal. Backend in Python/FastAPI, frontend in React.",
                    category: "Programming",
                    project_type: "Fixed Price",
                    budget: 1200.0,
                    experience_level: "Intermediate",
                    location: "United States",
                    skills: ["Python", "FastAPI", "React", "SQL"],
                    created_at: hours(2),
                    status: "open"
                },
                {
                    id: 6,
                    client_id: 7,
                    client_name: "Maple Apex Solutions",
                    client_country: "Canada",
                    title: "Technical Blog Post Writer for Cloud Computing",
                    description: "Need well-researched, engaging articles explaining cloud architecture and AI workflows to university beginners.",
                    category: "Content Writing",
                    project_type: "Fixed Price",
                    budget: 250.0,
                    experience_level: "Entry Level",
                    location: "Remote",
                    skills: ["Content Writing", "Technical Writing", "Cloud Computing"],
                    created_at: hours(5),
                    status: "open"
                }
            ],
            applications: [
                {
                    id: 1,
                    project_id: 1,
                    student_id: 1,
                    bid_amount: 15.0,
                    cover_letter: "I have extensive experience redesigning WordPress landing pages with modern UI principles. Please check my portfolio!",
                    estimated_days: 5,
                    status: "Submitted",
                    created_at: mins(12)
                },
                {
                    id: 2,
                    project_id: 2,
                    student_id: 1,
                    bid_amount: 20.0,
                    cover_letter: "I can build your course landing page to maximize student conversions.",
                    estimated_days: 4,
                    status: "Shortlisted",
                    created_at: mins(18)
                },
                {
                    id: 3,
                    project_id: 3,
                    student_id: 1,
                    bid_amount: 25.0,
                    cover_letter: "E-commerce WordPress setups are my specialty. Ready to start immediately.",
                    estimated_days: 7,
                    status: "Accepted",
                    created_at: mins(22)
                },
                {
                    id: 4,
                    project_id: 1,
                    student_id: 3,
                    bid_amount: 18.0,
                    cover_letter: "I am familiar with WordPress and fast landing pages.",
                    estimated_days: 6,
                    status: "Submitted",
                    created_at: mins(10)
                },
                {
                    id: 5,
                    project_id: 5,
                    student_id: 2,
                    bid_amount: 1100.0,
                    cover_letter: "Expert Python and React developer. Happy to build this assessment system.",
                    estimated_days: 14,
                    status: "Submitted",
                    created_at: hours(1)
                }
            ],
            reviews: [
                {
                    id: 1,
                    project_id: 3,
                    reviewer_id: 6,
                    reviewer_name: "Bengal Digital Media",
                    reviewee_id: 1,
                    rating: 5,
                    comment: "Akramul did an outstanding job on our WordPress layout! Highly communicative and delivered ahead of schedule.",
                    created_at: hours(24)
                },
                {
                    id: 2,
                    project_id: 1,
                    reviewer_id: 4,
                    reviewer_name: "HAV Design Studio",
                    reviewee_id: 1,
                    rating: 5,
                    comment: "Great work ethic and creative eye. Will definitely hire again!",
                    created_at: hours(48)
                }
            ]
        };

        // Add mock applications to match proposal counts in Image 1
        for (let i = 6; i <= 15; i++) {
            this.db.applications.push({
                id: i,
                project_id: 1,
                student_id: i % 2 === 0 ? 2 : 3,
                bid_amount: 15.0 + i,
                cover_letter: `Application and portfolio review from student #${i}`,
                estimated_days: 5 + (i % 3),
                status: "Submitted",
                created_at: mins(14 - (i % 10))
            });
        }
        for (let i = 16; i <= 34; i++) {
            this.db.applications.push({
                id: i,
                project_id: 2,
                student_id: i % 2 === 0 ? 2 : 3,
                bid_amount: 20.0 + (i % 5),
                cover_letter: `Sample proposal submission #${i}`,
                estimated_days: 4 + (i % 3),
                status: "Submitted",
                created_at: mins(19)
            });
        }
        for (let i = 35; i <= 49; i++) {
            this.db.applications.push({
                id: i,
                project_id: 3,
                student_id: 2,
                bid_amount: 25.0,
                cover_letter: `E-commerce proposal #${i}`,
                estimated_days: 7,
                status: "Submitted",
                created_at: mins(24)
            });
        }
        for (let i = 50; i <= 68; i++) {
            this.db.applications.push({
                id: i,
                project_id: 4,
                student_id: 1,
                bid_amount: 50.0,
                cover_letter: `Figma redesign proposal #${i}`,
                estimated_days: 10,
                status: "Submitted",
                created_at: mins(30)
            });
        }

        this.save();
    }

    // -----------------------------------------------------------------------
    // USERS & AUTH
    // -----------------------------------------------------------------------
    findUserByEmail(email) {
        return this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    findUserById(id) {
        return this.db.users.find(u => u.id === parseInt(id));
    }

    register(data) {
        const existing = this.findUserByEmail(data.email);
        if (existing) {
            throw new Error("Email already registered");
        }

        const newUser = {
            id: Date.now(),
            name: data.name,
            email: data.email.toLowerCase(),
            password: data.password,
            role: data.role,
            country: data.country || "United States",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
            created_at: new Date().toISOString(),
            profile: data.role === "student" ? {
                university: data.university || "University Student",
                major: data.major || "Computer Science",
                bio: "Passionate university student ready to provide high-quality services.",
                hourly_rate: 20.0,
                experience_level: "Intermediate",
                availability_status: "Available",
                github_url: "",
                portfolio_url: ""
            } : null,
            skills: data.role === "student" ? [
                { skill_name: "Web Development", proficiency: "Intermediate" }
            ] : [],
            portfolios: []
        };

        this.db.users.push(newUser);
        this.save();
        return newUser;
    }

    login(email, password) {
        const user = this.findUserByEmail(email);
        if (!user || user.password !== password) {
            throw new Error("Invalid email or password");
        }
        return user;
    }

    updateProfile(userId, profileData) {
        const user = this.findUserById(userId);
        if (!user) throw new Error("User not found");
        if (!user.profile) user.profile = {};

        Object.assign(user.profile, profileData);
        this.save();
        return user;
    }

    addSkill(userId, skill_name, proficiency = "Intermediate") {
        const user = this.findUserById(userId);
        if (!user) throw new Error("User not found");
        if (!user.skills) user.skills = [];

        const idx = user.skills.findIndex(s => s.skill_name.toLowerCase() === skill_name.toLowerCase());
        if (idx >= 0) {
            user.skills[idx].proficiency = proficiency;
        } else {
            user.skills.push({ skill_name: skill_name.trim(), proficiency });
        }
        this.save();
        return user.skills;
    }

    removeSkill(userId, skill_name) {
        const user = this.findUserById(userId);
        if (!user || !user.skills) return [];
        user.skills = user.skills.filter(s => s.skill_name.toLowerCase() !== skill_name.toLowerCase());
        this.save();
        return user.skills;
    }

    addPortfolio(userId, portfolioData) {
        const user = this.findUserById(userId);
        if (!user) throw new Error("User not found");
        if (!user.portfolios) user.portfolios = [];

        const item = {
            id: Date.now(),
            title: portfolioData.title,
            description: portfolioData.description,
            project_url: portfolioData.project_url || "",
            image_url: portfolioData.image_url || "",
            tags: portfolioData.tags || ""
        };
        user.portfolios.unshift(item);
        this.save();
        return item;
    }

    deletePortfolio(userId, portfolioId) {
        const user = this.findUserById(userId);
        if (!user || !user.portfolios) return;
        user.portfolios = user.portfolios.filter(p => p.id !== parseInt(portfolioId));
        this.save();
    }

    // -----------------------------------------------------------------------
    // DYNAMIC FILTER COUNT CALCULATOR (Eliminates Hardcoded Numbers)
    // -----------------------------------------------------------------------
    computeFilterCounts() {
        const openProjects = this.db.projects.filter(p => p.status === "open");

        const counts = {
            total: openProjects.length,
            experience: {
                any: openProjects.length,
                entry: 0,
                intermediate: 0,
                expert: 0
            },
            type: {
                hourly: 0,
                fixed: 0
            },
            budget: {
                any: openProjects.length,
                lt100: 0,
                between100and500: 0,
                between500and1k: 0,
                between1kand5k: 0,
                gt5k: 0
            },
            proposals: {
                any: openProjects.length,
                lt5: 0,
                between5and10: 0,
                between10and15: 0,
                between15and20: 0
            }
        };

        openProjects.forEach(p => {
            // Experience
            const exp = (p.experience_level || "").toLowerCase();
            if (exp.includes("entry")) counts.experience.entry++;
            else if (exp.includes("intermediate")) counts.experience.intermediate++;
            else if (exp.includes("expert")) counts.experience.expert++;

            // Type
            if (p.project_type === "Hourly") counts.type.hourly++;
            else counts.type.fixed++;

            // Budget
            const b = p.budget;
            if (b < 100) counts.budget.lt100++;
            else if (b >= 100 && b <= 500) counts.budget.between100and500++;
            else if (b > 500 && b <= 1000) counts.budget.between500and1k++;
            else if (b > 1000 && b <= 5000) counts.budget.between1kand5k++;
            else if (b > 5000) counts.budget.gt5k++;

            // Proposals
            const propCount = this.db.applications.filter(a => a.project_id === p.id).length;
            if (propCount < 5) counts.proposals.lt5++;
            else if (propCount >= 5 && propCount <= 10) counts.proposals.between5and10++;
            else if (propCount > 10 && propCount <= 15) counts.proposals.between10and15++;
            else if (propCount > 15 && propCount <= 20) counts.proposals.between15and20++;
        });

        return counts;
    }

    // -----------------------------------------------------------------------
    // PROJECTS & DYNAMIC SEARCH
    // -----------------------------------------------------------------------
    getProjects(filters = {}, currentUserId = null) {
        let list = this.db.projects.filter(p => p.status === "open").map(p => {
            const client = this.findUserById(p.client_id) || {};
            const pApps = this.db.applications.filter(a => a.project_id === p.id);
            const has_applied = currentUserId ? pApps.some(a => a.student_id === currentUserId) : false;

            return {
                ...p,
                client_name: client.name || p.client_name || "Verified Client",
                client_country: client.country || p.client_country || "United States",
                client_avatar: client.avatar_url || "",
                proposals_count: pApps.length,
                has_applied
            };
        });

        // Filter: Category
        if (filters.category && filters.category !== "All") {
            list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        }

        // Filter: Experience
        if (filters.experience_level && filters.experience_level !== "Any") {
            list = list.filter(p => p.experience_level.toLowerCase() === filters.experience_level.toLowerCase());
        }

        // Filter: Project Type
        if (filters.project_type) {
            list = list.filter(p => p.project_type === filters.project_type);
        }

        // Filter: Budget Range
        if (filters.budget_range && filters.budget_range !== "any") {
            if (filters.budget_range === "lt100") list = list.filter(p => p.budget < 100);
            else if (filters.budget_range === "100to500") list = list.filter(p => p.budget >= 100 && p.budget <= 500);
            else if (filters.budget_range === "500to1k") list = list.filter(p => p.budget > 500 && p.budget <= 1000);
            else if (filters.budget_range === "1kto5k") list = list.filter(p => p.budget > 1000 && p.budget <= 5000);
            else if (filters.budget_range === "gt5k") list = list.filter(p => p.budget > 5000);
        }

        // Filter: Proposals Range
        if (filters.proposals_range && filters.proposals_range !== "any") {
            if (filters.proposals_range === "lt5") list = list.filter(p => p.proposals_count < 5);
            else if (filters.proposals_range === "5to10") list = list.filter(p => p.proposals_count >= 5 && p.proposals_count <= 10);
            else if (filters.proposals_range === "10to15") list = list.filter(p => p.proposals_count > 10 && p.proposals_count <= 15);
            else if (filters.proposals_range === "15to20") list = list.filter(p => p.proposals_count > 15 && p.proposals_count <= 20);
        }

        // Filter: Search Keyword
        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            list = list.filter(p => {
                const combined = `${p.title} ${p.description} ${p.category} ${(p.skills || []).join(" ")}`.toLowerCase();
                return combined.includes(kw);
            });
        }

        // Sorting
        if (filters.sort_by === "highest_budget") {
            list.sort((a, b) => b.budget - a.budget);
        } else if (filters.sort_by === "lowest_proposals") {
            list.sort((a, b) => a.proposals_count - b.proposals_count);
        } else {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return {
            total_count: list.length,
            projects: list
        };
    }

    createProject(clientUser, data) {
        const newProject = {
            id: Date.now(),
            client_id: clientUser.id,
            client_name: clientUser.name,
            client_country: clientUser.country || "United States",
            title: data.title,
            description: data.description,
            category: data.category,
            project_type: data.project_type,
            budget: parseFloat(data.budget),
            experience_level: data.experience_level,
            location: data.location || "Remote",
            skills: data.skills || [],
            created_at: new Date().toISOString(),
            status: "open"
        };
        this.db.projects.unshift(newProject);
        this.save();
        return newProject;
    }

    deleteProject(projectId) {
        this.db.projects = this.db.projects.filter(p => p.id !== parseInt(projectId));
        this.db.applications = this.db.applications.filter(a => a.project_id !== parseInt(projectId));
        this.save();
    }

    // -----------------------------------------------------------------------
    // APPLICATIONS & PROPOSALS
    // -----------------------------------------------------------------------
    applyForProject(studentUser, projectId, data) {
        const pid = parseInt(projectId);
        const existing = this.db.applications.find(a => a.project_id === pid && a.student_id === studentUser.id);
        if (existing) {
            throw new Error("You have already submitted an application for this project");
        }

        const newApp = {
            id: Date.now(),
            project_id: pid,
            student_id: studentUser.id,
            bid_amount: parseFloat(data.bid_amount),
            cover_letter: data.cover_letter,
            estimated_days: parseInt(data.estimated_days) || 7,
            status: "Submitted",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.db.applications.unshift(newApp);
        this.save();
        return newApp;
    }

    getMyApplications(studentId) {
        return this.db.applications
            .filter(a => a.student_id === parseInt(studentId))
            .map(a => {
                const project = this.db.projects.find(p => p.id === a.project_id) || {};
                const client = this.findUserById(project.client_id) || {};
                return {
                    ...a,
                    project_title: project.title || "Project Opportunity",
                    category: project.category || "General",
                    project_type: project.project_type || "Hourly",
                    project_budget: project.budget || 0,
                    client_name: client.name || project.client_name || "Client",
                    client_country: client.country || "United States"
                };
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    getProjectApplications(projectId) {
        return this.db.applications
            .filter(a => a.project_id === parseInt(projectId))
            .map(a => {
                const student = this.findUserById(a.student_id) || {};
                const prof = student.profile || {};
                return {
                    ...a,
                    student_name: student.name || "Student Freelancer",
                    student_email: student.email || "",
                    student_country: student.country || "United States",
                    student_avatar: student.avatar_url || "",
                    university: prof.university || "University Student",
                    major: prof.major || "",
                    skills: student.skills || []
                };
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    updateApplicationStatus(applicationId, newStatus) {
        const app = this.db.applications.find(a => a.id === parseInt(applicationId));
        if (!app) throw new Error("Application not found");
        app.status = newStatus;
        app.updated_at = new Date().toISOString();
        this.save();
        return app;
    }

    // -----------------------------------------------------------------------
    // REVIEWS & RATINGS (Dynamic 5-Star Calculation)
    // -----------------------------------------------------------------------
    addReview(reviewerUser, data) {
        const review = {
            id: Date.now(),
            project_id: parseInt(data.project_id),
            reviewer_id: reviewerUser.id,
            reviewer_name: reviewerUser.name,
            reviewee_id: parseInt(data.reviewee_id),
            rating: parseInt(data.rating),
            comment: data.comment,
            created_at: new Date().toISOString()
        };
        this.db.reviews.unshift(review);
        this.save();
        return review;
    }

    getUserReviewStats(userId) {
        const userReviews = this.db.reviews.filter(r => r.reviewee_id === parseInt(userId));
        if (userReviews.length === 0) {
            return { average_rating: 5.0, total_reviews: 0, reviews: [] };
        }
        const sum = userReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average_rating: Number((sum / userReviews.length).toFixed(1)),
            total_reviews: userReviews.length,
            reviews: userReviews
        };
    }

    // -----------------------------------------------------------------------
    // ADVANCED RECOMMENDATIONS & BONUS MATCHING MECHANISM
    // -----------------------------------------------------------------------
    recommendProjectsForStudent(studentId) {
        const student = this.findUserById(studentId);
        if (!student) return [];
        const studentSkills = new Set((student.skills || []).map(s => s.skill_name.toLowerCase()));
        const studentExp = student.profile?.experience_level || "Intermediate";

        return this.db.projects.filter(p => p.status === "open").map(p => {
            const pSkills = new Set((p.skills || []).map(s => s.toLowerCase()));
            let skillMatchCount = 0;
            pSkills.forEach(s => {
                if (studentSkills.has(s)) skillMatchCount++;
            });

            const skillScore = pSkills.size > 0 ? (skillMatchCount / pSkills.size) : 0.5;
            const expOrder = { "Entry Level": 1, "Intermediate": 2, "Expert": 3 };
            const sLevel = expOrder[studentExp] || 2;
            const pLevel = expOrder[p.experience_level] || 2;
            const expScore = 1.0 - (Math.abs(sLevel - pLevel) * 0.25);

            const matchScore = Math.round((skillScore * 0.7 + expScore * 0.3) * 100);

            const client = this.findUserById(p.client_id) || {};
            const pApps = this.db.applications.filter(a => a.project_id === p.id);

            return {
                ...p,
                client_name: client.name || p.client_name,
                client_country: client.country || p.client_country,
                proposals_count: pApps.length,
                match_score: matchScore,
                has_applied: pApps.some(a => a.student_id === parseInt(studentId))
            };
        }).sort((a, b) => b.match_score - a.match_score);
    }

    matchStudentsForProject(projectId) {
        const project = this.db.projects.find(p => p.id === parseInt(projectId));
        if (!project) return [];

        const reqSkills = new Set((project.skills || []).map(s => s.toLowerCase()));
        const students = this.db.users.filter(u => u.role === "student");

        const weights = { "Expert": 1.0, "Intermediate": 0.8, "Beginner": 0.5 };

        return students.map(s => {
            const prof = s.profile || {};
            const sSkills = s.skills || [];
            const sSkillMap = new Map();
            sSkills.forEach(sk => sSkillMap.set(sk.skill_name.toLowerCase(), sk.proficiency));

            const matchedSkills = [];
            let weightedSum = 0;

            reqSkills.forEach(skill => {
                if (sSkillMap.has(skill)) {
                    matchedSkills.push(skill);
                    const lvl = sSkillMap.get(skill);
                    weightedSum += weights[lvl] || 0.7;
                }
            });

            const skillCoverage = reqSkills.size > 0 ? (matchedSkills.length / reqSkills.size) : 0.5;
            const skillQuality = reqSkills.size > 0 ? (weightedSum / reqSkills.size) : 0.5;

            const expBonus = prof.experience_level === project.experience_level ? 0.15 : 0.05;
            const reviewStats = this.getUserReviewStats(s.id);
            const ratingFactor = (reviewStats.average_rating / 5.0) * 0.15;
            const availFactor = prof.availability_status === "Available" ? 0.1 : 0.0;

            const matchPct = Math.min(100, Math.round((skillQuality * 0.6 + expBonus + ratingFactor + availFactor) * 100));

            return {
                id: s.id,
                name: s.name,
                email: s.email,
                avatar_url: s.avatar_url,
                country: s.country,
                university: prof.university,
                major: prof.major,
                hourly_rate: prof.hourly_rate,
                experience_level: prof.experience_level,
                avg_rating: reviewStats.average_rating,
                review_count: reviewStats.total_reviews,
                match_percentage: matchPct,
                matched_skills: matchedSkills,
                missing_skills: Array.from(reqSkills).filter(x => !matchedSkills.includes(x))
            };
        }).sort((a, b) => b.match_percentage - a.match_percentage);
    }

    // -----------------------------------------------------------------------
    // FREELANCERS DIRECTORY
    // -----------------------------------------------------------------------
    listStudents(filters = {}) {
        let students = this.db.users.filter(u => u.role === "student").map(s => {
            const stats = this.getUserReviewStats(s.id);
            return {
                ...s,
                university: s.profile?.university || "University Student",
                major: s.profile?.major || "Computer Science",
                bio: s.profile?.bio || "",
                hourly_rate: s.profile?.hourly_rate || 20,
                experience_level: s.profile?.experience_level || "Intermediate",
                avg_rating: stats.average_rating,
                review_count: stats.total_reviews
            };
        });

        if (filters.skill) {
            const sk = filters.skill.toLowerCase();
            students = students.filter(s => (s.skills || []).some(x => x.skill_name.toLowerCase().includes(sk)));
        }

        return students;
    }

    // -----------------------------------------------------------------------
    // ADMIN DASHBOARD ANALYTICS
    // -----------------------------------------------------------------------
    getAdminStats() {
        const totalUsers = this.db.users.length;
        const totalStudents = this.db.users.filter(u => u.role === "student").length;
        const totalClients = this.db.users.filter(u => u.role === "client").length;
        const totalProjects = this.db.projects.length;
        const totalApplications = this.db.applications.length;
        const totalReviews = this.db.reviews.length;
        const totalVolume = this.db.projects.reduce((acc, p) => acc + (p.budget || 0), 0);

        return {
            total_users: totalUsers,
            total_students: totalStudents,
            total_clients: totalClients,
            total_projects: totalProjects,
            total_applications: totalApplications,
            total_reviews: totalReviews,
            total_budget_volume: Math.round(totalVolume),
            users: this.db.users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                country: u.country,
                created_at: u.created_at
            }))
        };
    }

    deleteUser(userId) {
        this.db.users = this.db.users.filter(u => u.id !== parseInt(userId));
        this.db.projects = this.db.projects.filter(p => p.client_id !== parseInt(userId));
        this.db.applications = this.db.applications.filter(a => a.student_id !== parseInt(userId));
        this.save();
    }
}

// Global Store Instance (Isomorphic)
if (typeof window !== 'undefined') {
    window.prilansStore = new PrilansStore();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PrilansStore };
}

