import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import './Placeholder.css';

function Placeholder({ title }) {
  return (
    <Layout>
      <section className="placeholder">
        <KolamPattern />
        <h1 className="placeholder__title">{title}</h1>
      </section>
    </Layout>
  );
}

export default Placeholder;
