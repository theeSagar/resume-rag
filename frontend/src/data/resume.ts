// Transcribed from data/sagar_python_2Y.pdf. The phone number is deliberately left out.
export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
  /** Ids of entries in `projects` shipped in this role; rendered as links, not repeated. */
  shipped?: string[];
  ask: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  kind: "Professional" | "Personal";
  stack: string[];
  bullets: string[];
  ask: string;
  liveUrl?: string;
  /** Screenshot under public/projects/. */
  image?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Education {
  degree: string;
  field: string;
  institute: string;
  period: string;
}

export interface Resume {
  title: string;
  objective: string;
  locationPreference: string;
  overviewQuestion: string;
  summary: string[];
  experience: Experience[];
  projects: Project[];
  competencies: string[];
  skills: SkillGroup[];
  education: Education[];
  certifications: string[];
  accomplishments: string[];
}

export const resume: Resume = {
  title: "Software Engineer",
  objective:
    "Targeting challenging opportunities in Backend Software Engineering, Python Development, Django/FastAPI Development or AI-Driven Application Development across diverse industries.",
  locationPreference: "Delhi NCR, Jaipur (open to relocate)",
  overviewQuestion: "Give me a quick overview of Sagar's profile and strengths.",
  summary: [
    "Software Engineer with nearly 2 years of experience in designing and developing scalable backend applications using Python, Django REST Framework, FastAPI, PostgreSQL, Redis, and Kafka across government digital transformation and enterprise technology projects.",
    "Expertise in building RESTful APIs, automation solutions, payment integrations, real-time communication systems, and database-driven applications.",
    "Hands-on experience delivering critical solutions for government initiatives, including industrial development, education & public service platforms.",
    "Knowledgeable about emerging AI technologies with practical exposure to LLM-powered applications, RAG pipelines, vector databases (pgvector) & prompt engineering.",
  ],
  experience: [
    {
      role: "Associate Software Engineer",
      company: "Primus Partners Solutions",
      period: "2024 – Present",
      location: "Delhi, India",
      ask: "What does Sagar do at Primus Partners?",
      bullets: [
        "Own critical backend modules for state-government platforms, working directly with client departments from first requirement to production.",
        "Earned a Quarter Award for a project that unlocked roughly ₹1.5 crore in business value.",
      ],
      shipped: ["mpidc", "cgem"],
    },
    {
      role: "Proposal Analyst Intern",
      company: "SDLC Corp",
      period: "2023 – 2024",
      location: "Noida, India",
      ask: "What did Sagar do during his internship at SDLC Corp?",
      bullets: [
        "Turned business requirements into backend specifications, then built the Python APIs behind them.",
      ],
    },
  ],
  projects: [
    {
      id: "mpidc",
      name: "MPIDC Single Window System",
      tagline: "Ends the department-by-department chase: investors find land, incentives and clearances in one portal",
      kind: "Professional",
      liveUrl: "https://sws.invest.mp.gov.in/",
      image: "/projects/mpidc.webp",
      stack: ["Django REST", "PostgreSQL", "Kafka", "Razorpay"],
      ask: "Explain the MPIDC Single Window System project in detail.",
      bullets: [
        "Architected the Django REST services behind investor applications and cross-department approval workflows.",
        "Wired in Razorpay payments and Kafka-driven event processing, with Swagger-documented APIs for partner departments.",
      ],
    },
    {
      id: "cgem",
      name: "C-GEM",
      tagline: "Makes the carbon market answer to growers, not just buyers: readable contracts, traceable revenue",
      kind: "Professional",
      liveUrl: "https://cgem.org.in/",
      image: "/projects/cgem.webp",
      stack: ["Flask", "Flask-SocketIO", "PostgreSQL"],
      ask: "How did Sagar build C-GEM for 1,000–2,000 concurrent users?",
      bullets: [
        "Engineered real-time group communication that holds 1,000–2,000 concurrent users.",
        "Designed role-based access so NGOs, investors and developers each see exactly what they should.",
      ],
    },
    {
      id: "rag",
      name: "AI Résumé Assistant",
      tagline: "The AI you can talk to on this site",
      kind: "Personal",
      stack: ["FastAPI", "pgvector", "Llama / Gemini"],
      ask: "Tell me about Sagar's AI Assistant and RAG pipeline project.",
      bullets: [
        "Retrieval-Augmented Generation over my career: chunking, embeddings and pgvector search, answered by Llama or Gemini.",
        "An agent router sends each question to retrieval, tool calling or plain chat.",
      ],
    },
  ],
  competencies: [
    "Backend Application Development",
    "Python Software Engineering",
    "Django REST Framework Development",
    "FastAPI Application Development",
    "RESTful API Design & Integration",
    "Microservices & Distributed Systems",
    "Workflow Automation & Process Digitization",
    "Real-Time Communication Systems",
    "Database Design & Performance Optimization",
    "Event-Driven Architecture (Kafka)",
    "AI/LLM Application Development",
    "Retrieval-Augmented Generation (RAG)",
  ],
  skills: [
    { label: "Programming Languages", items: ["Python", "SQL"] },
    { label: "Frameworks & Libraries", items: ["Django", "FastAPI", "Plotly"] },
    { label: "Databases", items: ["PostgreSQL", "pgvector"] },
    { label: "Messaging & Caching", items: ["Kafka", "Redis"] },
    { label: "Cloud & DevOps", items: ["AWS", "Git"] },
  ],
  education: [
    {
      degree: "Master of Business Administration (MBA)",
      field: "Marketing",
      institute: "Dayalbagh Educational Institute, Agra",
      period: "2021 – 2023",
    },
    {
      degree: "Bachelor of Vocation (B.Voc.)",
      field: "Automobile",
      institute: "Dayalbagh Educational Institute, Agra",
      period: "2018 – 2021",
    },
  ],
  certifications: ["Clean Code (Udemy)", "Zero to Hero in SQL: SQL for Data Analytics (Udemy)"],
  accomplishments: [
    "Received a Quarter Award at Primus Partners for contributing to a project that generated approximately ₹1.5 crore in business value for the organization.",
    "Delivered backend solutions for multiple government digital transformation projects, contributing to process modernization, workflow automation, and improved citizen and stakeholder service accessibility.",
    "Engineered a scalable real-time chat platform supporting 1,000–2,000 concurrent users, enhancing collaboration through secure role-based access and low-latency communication.",
  ],
};
