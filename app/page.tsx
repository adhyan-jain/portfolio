import { initialsOf, visibleNav, config } from "@/lib/config";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Technologies from "@/components/sections/Technologies";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Projects from "@/components/sections/Projects";
import Interests from "@/components/sections/Interests";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const { profile } = config;

  return (
    <>
      <Nav
        initials={initialsOf(profile?.initials, profile?.name)}
        links={visibleNav()}
      />

      <main>
        <Hero />
        <About />
        <Technologies />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Interests />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
