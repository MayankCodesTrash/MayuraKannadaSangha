import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';

function Placeholder({ title }) {
  return (
    <Layout>
      <section
        style={{
          minHeight: '100vh',
          background: 'var(--color-yellow)',
          paddingTop: 'var(--nav-height)',
        }}
      >
        <KolamPattern />
        <h1
          style={{
            position: 'relative',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            marginTop: '64px',
          }}
        >
          {title}
        </h1>
      </section>
    </Layout>
  );
}

export default Placeholder;
