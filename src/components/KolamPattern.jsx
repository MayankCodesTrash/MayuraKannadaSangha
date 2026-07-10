import './KolamPattern.css';

function KolamPattern() {
  return (
    <svg className="kolam-pattern" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern
          id="kolam-tile"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="40" cy="10" r="3" fill="var(--color-text-dark)" />
          <circle cx="10" cy="40" r="3" fill="var(--color-text-dark)" />
          <circle cx="70" cy="40" r="3" fill="var(--color-text-dark)" />
          <circle cx="40" cy="70" r="3" fill="var(--color-text-dark)" />
          <circle cx="40" cy="40" r="3" fill="var(--color-text-dark)" />
          <path
            d="M40,10 L70,40 L40,70 L10,40 Z"
            fill="none"
            stroke="var(--color-text-dark)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kolam-tile)" />
    </svg>
  );
}

export default KolamPattern;
