import Layout from '../components/Layout.jsx';
import HeroVideo from '../components/HeroVideo.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import './Home.css';

function Home() {
  return (
    <Layout>
      <HeroVideo />
      <section className="home__blank">
        <KolamPattern />
      </section>
    </Layout>
  );
}

export default Home;
