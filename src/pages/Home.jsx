import Layout from '../components/Layout.jsx';
import Hero from '../components/Hero.jsx';
import TopBanner from '../components/TopBanner.jsx';
import AboutSection from '../components/AboutSection.jsx';
import HomeEventsPreview from '../components/HomeEventsPreview.jsx';
import './Home.css';

function Home() {
  return (
    <Layout>
      <Hero />
      <TopBanner />
      <section className="home__intro">
        <AboutSection />
      </section>
      <HomeEventsPreview />
    </Layout>
  );
}

export default Home;
