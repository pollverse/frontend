import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CreateDAOCTA from '../../components/homePage/CreateDAOCTA';
import DAOGrid from '../../components/homePage/DAOGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover DAOs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore decentralized autonomous organizations, participate in governance, and help shape the future of communities.
            </p>
          </div>

          {/* Create DAO CTA */}
          <CreateDAOCTA />

          {/* DAO Grid */}
          <DAOGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
}