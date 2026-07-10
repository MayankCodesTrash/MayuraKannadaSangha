import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
