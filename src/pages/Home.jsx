import Layout from '../components/Layout.jsx';
import LogoBanner from '../components/LogoBanner.jsx';
import Hero from '../components/Hero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import HomeEventsPreview from '../components/HomeEventsPreview.jsx';
import HomePhotoHighlights from '../components/HomePhotoHighlights.jsx';
import './Home.css';

function Home() {
  return (
    <Layout>
      <LogoBanner />
      <Hero />
      <section className="home__intro">
        <AboutSection />
      </section>
      <HomeEventsPreview />
      <HomePhotoHighlights />
    </Layout>
  );
}

export default Home;
