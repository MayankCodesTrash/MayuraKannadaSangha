import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import KolamPattern from './KolamPattern.jsx';

function Layout({ children }) {
  return (
    <>
      <KolamPattern />
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
