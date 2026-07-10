import { motion } from 'framer-motion';
import './WaveDivider.css';

const WAVE_PATH_A =
  'M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z';
const WAVE_PATH_B =
  'M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z';

function WaveDivider({ flip = false }) {
  return (
    <div className={`wave-divider${flip ? ' wave-divider--flip' : ''}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={WAVE_PATH_A}
          fill="var(--color-orange)"
          animate={{ d: [WAVE_PATH_A, WAVE_PATH_B, WAVE_PATH_A] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

export default WaveDivider;
