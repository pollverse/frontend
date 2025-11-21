import AboutHero from "@/components/AboutHero";
import MissionAndFeatures from "@/components/MissionAndFeatures";
import StatsAndTeam from "@/components/StatsAndTeam";

export default function AboutPage() {
  return (
    <div className="min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <AboutHero />
        <MissionAndFeatures />
        <StatsAndTeam />
      </main>
    </div>
  );
}
