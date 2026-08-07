import NavBar from './NavBar.jsx';
import TopBanner from './TopBanner.jsx';
import Footer from './Footer.jsx';
import KolamPattern from './KolamPattern.jsx';

function Layout({ children }) {
  return (
    <>
      <KolamPattern />
      <NavBar />
      <TopBanner />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
