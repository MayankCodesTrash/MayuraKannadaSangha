import ImageCarousel from './ImageCarousel.jsx';
import { GALLERY_IMAGES } from '../data/galleryImages.js';
import './AboutSection.css';

function AboutSection() {
  return (
    <div className="about">
      <div className="about__panel">
        <p className="about__paragraph about__paragraph--english">
          Mayura Kannada Sangha – Des Moines is a dynamic cultural organization dedicated to
          preserving and promoting Kannada language, arts, and traditions in Iowa. It serves as a
          vibrant platform for Kannadigas in and around Des Moines to come together, celebrate
          their heritage, and pass it on to future generations.
        </p>
        <p className="about__paragraph about__paragraph--kannada">
          ಮಯೂರ ಕನ್ನಡ ಸಂಘ – ಡೆಸ್ ಮಾಯ್ನ್ಸ್ ಎಂಬುದು ಐವಾಯಲ್ಲಿನ ಕನ್ನಡಿಗರ ಸಾಂಸ್ಕೃತಿಕ ಸಂಘಟನೆಯಾಗಿದ್ದು, ಕನ್ನಡ
          ಭಾಷೆ, ಕಲೆ ಮತ್ತು ಪರಂಪರೆಯ ಸಂರಕ್ಷಣೆಯತ್ತ ಮತ್ತು ಉತ್ಸವದ ಆಚರಣೆಯತ್ತ ತಮ್ಮ ಶ್ರದ್ಧೆಯುಳ್ಳ ಪ್ರಯತ್ನವನ್ನು
          ನೀಡುತ್ತಿದೆ. ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು ಎಲ್ಲಾ ವಯಸ್ಸಿನವರನ್ನು ಒಳಗೊಂಡಿದ್ದು, ಸಂಸ್ಕೃತಿಯ ಹರಿವು ಮುಂದುವರೆಯಲು
          ಸೇತುವೆಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ.
        </p>
      </div>
      <div className="about__carousel">
        <ImageCarousel images={GALLERY_IMAGES} interval={2500} />
      </div>
    </div>
  );
}

export default AboutSection;
