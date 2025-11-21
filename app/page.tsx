import CTASection from "@/components/CTASection";
import Features from "@/components/Features";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <Hero />
        <Features />
        <CTASection />
      </main>
    </div>
  );
}
