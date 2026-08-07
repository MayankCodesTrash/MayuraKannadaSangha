import './TopBanner.css';

function TopBanner() {
  return (
    <div className="top-banner">
      <span className="top-banner__text">
        A Registered, Non-Profit, Tax-Exempt 501(c)(3) Organization
      </span>
      <div className="top-banner__actions">
        <a
          className="top-banner__button"
          href="https://www.zeffy.com/en-US/ticketing/mayura-kannada-sangha-annual-membership-registration--2026"
          target="_blank"
          rel="noopener noreferrer"
        >
          Become a Member
        </a>
        <a
          className="top-banner__button"
          href="https://www.zeffy.com/en-US/donation-form/mayura-kannada-sangha-sponsorships--2026"
          target="_blank"
          rel="noopener noreferrer"
        >
          Become a Sponsor
        </a>
      </div>
    </div>
  );
}

export default TopBanner;
