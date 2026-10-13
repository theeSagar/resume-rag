import { useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { AboutSiteSection } from "../components/home/AboutSiteSection";
import { ContactSection } from "../components/home/ContactSection";
import { EducationSection } from "../components/home/EducationSection";
import { ExperienceSection } from "../components/home/ExperienceSection";
import { Hero } from "../components/home/Hero";
import { ProjectsSection } from "../components/home/ProjectsSection";
import { SkillsSection } from "../components/home/SkillsSection";

export function HomePage() {
  const navigate = useNavigate();
  const ask = (question: string) => navigate("/chat", { state: { ask: question } });

  return (
    <>
      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 sm:px-8">
        <Hero onAsk={ask} />
        <ExperienceSection onAsk={ask} />
        <ProjectsSection onAsk={ask} />
        <SkillsSection />
        <EducationSection />
        <AboutSiteSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
