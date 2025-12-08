import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AboutHero from '../../components/aboutPage/AboutHero';
import Mission from '../../components/aboutPage/Mission';
import DetailedFeatures from '../../components/aboutPage/DetailedFeatures';
import Stats from '../../components/aboutPage/Stats';
import Team from '../../components/aboutPage/Team';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AboutHero />
        <Mission />
        <DetailedFeatures />
        <Stats />
        <Team />
      </main>
      <Footer />
    </div>
  );
}