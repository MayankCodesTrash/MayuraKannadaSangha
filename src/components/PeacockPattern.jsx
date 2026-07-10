import './PeacockPattern.css';

function PeacockPattern() {
  return (
    <svg className="peacock-pattern" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern
          id="peacock-tile"
          width="110"
          height="110"
          patternUnits="userSpaceOnUse"
        >
          <ellipse
            cx="55"
            cy="55"
            rx="22"
            ry="30"
            fill="none"
            stroke="var(--color-text-light)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="55"
            cy="55"
            rx="13"
            ry="18"
            fill="none"
            stroke="var(--color-text-light)"
            strokeWidth="1.5"
          />
          <circle cx="55" cy="50" r="4" fill="var(--color-text-light)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#peacock-tile)" />
    </svg>
  );
}

export default PeacockPattern;
