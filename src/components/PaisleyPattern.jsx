import './PaisleyPattern.css';

function PaisleyPattern() {
  return (
    <svg className="paisley-pattern" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern
          id="paisley-tile"
          width="90"
          height="90"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M45,18 C60,18 66,34 58,48 C52,59 37,63 27,55 C17,47 16,32 26,23 C31,19 38,17 45,18 Z"
            fill="none"
            stroke="var(--color-text-light)"
            strokeWidth="1.5"
          />
          <circle cx="45" cy="28" r="2.5" fill="var(--color-text-light)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#paisley-tile)" />
    </svg>
  );
}

export default PaisleyPattern;
