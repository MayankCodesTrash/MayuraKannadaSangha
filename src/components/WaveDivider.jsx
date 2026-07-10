import { motion } from 'framer-motion';
import './WaveDivider.css';

const WAVE_PATH_A =
  'M0,60 C120,10 240,10 360,60 C480,110 600,110 720,60 C840,10 960,10 1080,60 C1200,110 1320,110 1440,60 L1440,120 L0,120 Z';
const WAVE_PATH_B =
  'M0,60 C120,110 240,110 360,60 C480,10 600,10 720,60 C840,110 960,110 1080,60 C1200,10 1320,10 1440,60 L1440,120 L0,120 Z';

function WaveDivider({ flip = false, fill = 'var(--color-orange)', opacity = 1, delay = 0 }) {
  return (
    <div
      className={`wave-divider${flip ? ' wave-divider--flip' : ''}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          initial={{ d: WAVE_PATH_A }}
          fill={fill}
          animate={{ d: [WAVE_PATH_A, WAVE_PATH_B, WAVE_PATH_A] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      </svg>
    </div>
  );
}

export default WaveDivider;
