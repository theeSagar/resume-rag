export interface HeroStat {
  label: string;
  value: string;
  caption: string;
}

export interface Profile {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  tagline: string;
  email: string;
  location: string;
  /** Add your profile URLs here. Each icon stays hidden while its URL is empty. */
  github: string;
  linkedin: string;
  resumeUrl: string;
  resumeFileName: string;
  headline: string;
  intro: string;
  availability: string;
  now: { title: string; detail: string };
  heroStats: HeroStat[];
  heroQuestions: string[];
}

export const profile: Profile = {
  name: "Sagar Verma",
  firstName: "Sagar",
  initials: "SV",
  role: "Software Engineer",
  tagline: "Python · FastAPI · Django · RAG",
  email: "sagar.karanveer1@gmail.com",
  location: "Delhi NCR, India",
  github: "",
  linkedin: "",
  resumeUrl: "/resume.pdf",
  resumeFileName: "Sagar_Verma_Resume.pdf",
  headline: "Backend & AI Engineer",
  intro:
    "I build government-scale backend platforms with Python, Django and FastAPI at Primus Partners, and RAG-powered AI on the side. This site is one of them: ask it anything about my work.",
  availability: "Open to roles · Delhi NCR · Jaipur · relocate",
  now: {
    title: "Associate Software Engineer · Primus Partners",
    detail: "Building MPIDC's Single Window System — Django REST, PostgreSQL, Razorpay, Kafka workflows.",
  },
  heroStats: [
    { label: "Experience", value: "2 years", caption: "building production backends" },
    { label: "Peak scale", value: "2,000", caption: "concurrent users on C-GEM" },
    { label: "Recognition", value: "₹1.5 Cr", caption: "business value · Quarter Award" },
  ],
  heroQuestions: [
    "Explain the MPIDC Single Window System",
    "How was C-GEM built for 2,000 concurrent users?",
    "What has Sagar achieved at Primus Partners?",
  ],
};

export interface ChatSuggestion {
  question: string;
  /** Shown after the question, e.g. which agent answers it. */
  hint?: string;
}

export const chatSuggestions: ChatSuggestion[] = [
  { question: "How was C-GEM built for 2,000 concurrent users?" },
  { question: "What is Sagar's backend tech stack?" },
  { question: "Has he worked with Kafka and Redis?" },
  { question: "What is Sagar's education?" },
  { question: "What's the weather in Delhi?", hint: "tool agent" },
  { question: "Hi, how are you?", hint: "chat agent" },
];
