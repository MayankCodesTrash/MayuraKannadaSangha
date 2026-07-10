import WaveDivider from './WaveDivider.jsx';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <WaveDivider />
      <div className="footer__content">
        <p className="footer__name">Mayura Kannada Sangha • Des Moines, Iowa</p>
        <p className="footer__copyright">
          © {new Date().getFullYear()} Mayura Kannada Sangha, Central Iowa
        </p>
      </div>
    </footer>
  );
}

export default Footer;
