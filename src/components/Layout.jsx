import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import KolamPattern from './KolamPattern.jsx';
import TopBanner from './TopBanner.jsx';

function Layout({ children }) {
  return (
    <>
      <KolamPattern />
      <TopBanner />
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
