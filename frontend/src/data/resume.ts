// Transcribed from data/sagar_python_2Y.pdf. The phone number is deliberately left out.
export interface ExperienceProject {
  name: string;
  bullets: string[];
  highlights: string[];
  ask: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets?: string[];
  highlights?: string[];
  projects?: ExperienceProject[];
  ask: string;
}

export interface Project {
  name: string;
  tagline: string;
  kind: "Professional" | "Personal";
  stack: string[];
  bullets: string[];
  ask: string;
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
        "Worked directly with clients and owned critical backend modules.",
        "Received a Quarter Award for contributing to a project that generated approximately ₹1.5 crore in business value for the organization.",
      ],
      projects: [
        {
          name: "MPIDC (Single Window System)",
          ask: "Explain the MPIDC Single Window System project in detail.",
          bullets: [
            "Designed backend services for MPIDC (Madhya Pradesh Industrial Development Corporation) utilizing Python, Django REST Framework, PostgreSQL, ORM & SQL, including Razorpay payment gateway integration & Kafka-driven workflow processing.",
            "Built and maintained RESTful APIs for government workflow applications using Django REST Framework and PostgreSQL, while producing API documentation through Swagger and supporting cross-department system integrations.",
          ],
          highlights: [
            "Django REST + PostgreSQL backend services",
            "Razorpay payments & Kafka-driven workflows",
            "Swagger-documented cross-department APIs",
          ],
        },
        {
          name: "C-GEM",
          ask: "How did Sagar build C-GEM for 1,000–2,000 concurrent users?",
          bullets: [
            "Designed and implemented a real-time group communication platform supporting 1,000–2,000 concurrent users using Flask-SocketIO.",
            "Developed backend services and REST APIs using Flask and PostgreSQL, enabling secure and scalable application functionality.",
            "Established role-based access control mechanisms for multiple stakeholder groups, including NGOs, Investors & Developers, ensuring controlled access to platform resources.",
          ],
          highlights: [
            "Real-time group chat for 1,000–2,000 concurrent users",
            "Flask-SocketIO with PostgreSQL REST APIs",
            "Role-based access for NGOs, investors & developers",
          ],
        },
      ],
    },
    {
      role: "Proposal Analyst Intern",
      company: "SDLC Corp",
      period: "2023 – 2024",
      location: "Noida, India",
      ask: "What did Sagar do during his internship at SDLC Corp?",
      bullets: [
        "Evaluated business & technical requirements, translating them into backend specifications & scalable Python-based solutions while collaborating with cross-functional teams.",
        "Developed APIs and backend components in accordance with functional requirements, contributing to solution design, technical documentation & implementation planning.",
      ],
      highlights: [
        "Requirements turned into backend specifications",
        "APIs and backend components to spec",
        "Solution design & technical documentation",
      ],
    },
  ],
  projects: [
    {
      name: "MPIDC Single Window System",
      tagline: "Madhya Pradesh Industrial Development Corporation",
      kind: "Professional",
      stack: ["Python", "Django", "ReactJS", "PostgreSQL"],
      ask: "What was Sagar's role in architecting the MPIDC Single Window System?",
      bullets: [
        "Architecting backend services for the MPIDC Single Window System using Python and Django REST Framework while delivering RESTful APIs & supporting government processes.",
        "Managing data operations through PostgreSQL using both ORM and optimized SQL queries, ensuring efficient backend functionality, system integration, and application performance.",
      ],
    },
    {
      name: "AI Assistant & RAG Pipeline",
      tagline: "Chunking, embeddings, pgvector search and tool calling. You're using it right now.",
      kind: "Personal",
      stack: ["Python", "OpenAI SDK", "Llama", "Requests"],
      ask: "Tell me about Sagar's AI Assistant and RAG pipeline project.",
      bullets: [
        "Developed an AI-powered chatbot leveraging OpenAI-compatible APIs (Llama/Gemini) & implemented Retrieval-Augmented Generation (RAG) concepts including text chunking, embedding generation, and vector search integration using PostgreSQL with pgvector.",
        "Designed Python-based AI workflow integrating OpenAI-compatible APIs, tool-calling skills, prompt orchestration & retrieval mechanisms to enable conversational interactions.",
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
