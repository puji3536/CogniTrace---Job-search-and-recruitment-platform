import React, { useEffect, useState } from "react";
import "./Home.css";

function Home() {
    const [verifiedSkills, setVerifiedSkills] = useState([]);
    const [sortedJobs, setSortedJobs] = useState([]);
    const [filterMode, setFilterMode] = useState("all");

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) return;

        fetch("http://localhost:8000/skills/", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.status === 401 ? [] : res.json())
            .then(data => {
                if (!Array.isArray(data)) { setVerifiedSkills([]); return; }
                const vs = data.filter(s => s.verified === true).map(s => s.name.toLowerCase());
                setVerifiedSkills(vs);
            })
            .catch(err => console.error("Fetch skills error:", err));
    }, []);

    const jobs = [
        { id: 1, company: "Amazon", company_logo: "https://pngimg.com/d/amazon_PNG13.png", role: "Software Development Engineer", description: "Build software for global Amazon systems", skills_required: ["Java", "Python", "AWS", "Algorithms"], apply_link: "https://www.amazon.jobs/software-development" },
        { id: 2, company: "HCLTech", company_logo: "https://static.ambitionbox.com/assets/v2/images/rs:fit:1280:960:false:false/bG9jYWw6Ly8vbG9nb3Mvb3JpZ2luYWxzL2hjbC10ZWNobm9sb2dpZXMuanBn.png", role: "Software Engineer", description: "Build technology solutions for clients", skills_required: ["Java", "Python", "Cloud Tech"], apply_link: "https://www.hcltech.com/careers/careers-in-india" },
        { id: 3, company: "Cognizant", company_logo: "https://th.bing.com/th/id/OIP.OQEX31IKLrCZ7l-Nmxe9iwHaCO?w=338&h=105&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1", role: "Programmer Analyst", description: "Develop applications in Agile teams", skills_required: ["Java", ".NET", "Testing Frameworks"], apply_link: "https://careers.cognizant.com/global-en/" },
        { id: 4, company: "Oracle", company_logo: "https://1000logos.net/wp-content/uploads/2021/04/Oracle-logo.png", role: "Software Developer", description: "Develop database and cloud applications", skills_required: ["Java", "PL/SQL", "Databases", "SQL"], apply_link: "https://careers.oracle.com/jobs/#en/sites/jobsearch/" },
        { id: 5, company: "Google", company_logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", role: "Software Engineer III – Google Cloud", description: "Design and build scalable cloud systems in India", skills_required: ["Python", "Java", "C++", "System Design"], apply_link: "https://www.google.com/about/careers/applications/jobs/results?location=India" },
        { id: 6, company: "Microsoft", company_logo: "https://th.bing.com/th/id/OIP.vaI5mdOwfF8e50rGYjsdKgHaE6?w=235&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1", role: "Software Engineer II", description: "Develop and maintain scalable products in Bengaluru", skills_required: ["C#", ".NET", "Azure", "Problem-Solving"], apply_link: "https://careers.microsoft.com/v2/global/en/locations/bengaluru.html" },
        { id: 7, company: "IBM", company_logo: "https://static.vecteezy.com/system/resources/previews/021/515/152/original/ibm-brand-symbol-software-computer-logo-white-design-illustration-with-blue-background-free-vector.jpg", role: "Software Developer", description: "Create, test, and integrate enterprise software", skills_required: ["Java", "React", "SQL", "Agile"], apply_link: "https://www.ibm.com/in-en/careers/software-engineering" },
        { id: 8, company: "TCS", company_logo: "https://th.bing.com/th/id/OIP.iz0l2PLYQDTZgy32ELt1UAHaEa?w=306&h=182&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1", role: "Software Engineer", description: "Deliver software projects for global clients", skills_required: ["Java", "Python", "Oracle", "SDLC"], apply_link: "https://www.tcs.com/careers/india" },
        { id: 9, company: "SAP", company_logo: "https://th.bing.com/th/id/OIP.F7o41FsGRcf-dDgaY05ucAHaEK?w=290&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1", role: "Developer Associate", description: "Build ERP software and cloud applications", skills_required: ["ABAP", "Java", "Fiori", "SQL"], apply_link: "https://jobs.sap.com/go/Developer-Jobs-in-India/865701/" },
        { id: 10, company: "LTIMindtree", company_logo: "https://th.bing.com/th/id/OIP.yRaU85_hyh-qN5XZ5-6RVQHaD4?w=333&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1", role: "Software Engineer", description: "Develop full-stack applications", skills_required: ["Java", "Spring", "React"], apply_link: "https://www.ltimindtree.com/india-careers/" }
    ];

    function getMatchPercent(job) {
        const matched = job.skills_required.filter(s => verifiedSkills.includes(s.toLowerCase())).length;
        return Math.round((matched / job.skills_required.length) * 100);
    }

    function getMissingSkills(job) {
        return job.skills_required.filter(s => !verifiedSkills.includes(s.toLowerCase()));
    }

    function getMatchColor(percent) {
        if (percent >= 75) return "#22c55e";
        if (percent >= 40) return "#f59e0b";
        return "#ef4444";
    }

    useEffect(() => {
        const sorted = [...jobs].sort((a, b) => getMatchPercent(b) - getMatchPercent(a));
        setSortedJobs(sorted);
    }, [verifiedSkills]);

    const displayedJobs = filterMode === "qualified"
        ? sortedJobs.filter(job => getMatchPercent(job) >= 50)
        : sortedJobs;

    return (
        <div className="content">
            <div className="home-header">
                <h2 className="home-title">Recommended Jobs</h2>
                <div className="filter-toggle">
                    <button
                        className={filterMode === "all" ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFilterMode("all")}
                    >
                        All Jobs
                    </button>
                    <button
                        className={filterMode === "qualified" ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFilterMode("qualified")}
                    >
                        ✓ I Qualify (≥50%)
                    </button>
                </div>
            </div>

            {displayedJobs.length === 0 && filterMode === "qualified" && (
                <div className="no-jobs-msg">
                    No jobs match 50%+ of your verified skills yet.{" "}
                    <a href="#/skills">Verify more skills →</a>
                </div>
            )}

            <div className="jobs-container">
                {displayedJobs.map((job) => {
                    const matchPercent = getMatchPercent(job);
                    const missingSkills = getMissingSkills(job);
                    const matchColor = getMatchColor(matchPercent);

                    return (
                        <div key={job.id} className="job-card">
                            <div className="match-badge" style={{ background: matchColor }}>
                                {matchPercent}% Match
                            </div>

                            <img src={job.company_logo} alt={job.company} className="company-logo" />

                            <div className="job-info">
                                <h3 className="job-role">{job.role}</h3>
                                <p className="job-jd">{job.description}</p>

                                <div className="skills-row">
                                    {job.skills_required.map((skill) => (
                                        <span
                                            key={skill}
                                            className={verifiedSkills.includes(skill.toLowerCase()) ? "skill-tag verified" : "skill-tag"}
                                        >
                                            {verifiedSkills.includes(skill.toLowerCase()) ? "✓ " : ""}{skill}
                                        </span>
                                    ))}
                                </div>

                                {missingSkills.length > 0 && (
                                    <div className="missing-skills">
                                        <span className="missing-label">Missing:</span>
                                        {missingSkills.map(s => (
                                            <span key={s} className="missing-tag">{s}</span>
                                        ))}
                                    </div>
                                )}

                                <button className="apply-btn" onClick={() => window.open(job.apply_link, "_blank")}>
                                    Apply
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Home;