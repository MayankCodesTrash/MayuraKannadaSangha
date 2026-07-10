import { useEffect, useRef } from 'react';
import { getScrubProgress } from '../utils/scroll.js';
import WaveDivider from './WaveDivider.jsx';
import './HeroVideo.css';

function HeroVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    let rafId = null;

    function updateVideoFrame() {
      rafId = null;
      const rect = container.getBoundingClientRect();
      const progress = getScrubProgress(rect.top, rect.height, window.innerHeight);
      if (video.duration && !Number.isNaN(video.duration)) {
        video.currentTime = progress * video.duration;
      }
    }

    function onScroll() {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateVideoFrame);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hero" ref={containerRef}>
      <div className="hero__sticky">
        <video
          ref={videoRef}
          className="hero__video"
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/0709.mp4" type="video/mp4" />
        </video>
        <div className="hero__tint" />
        <div className="hero__scrim" />
        <div className="hero__wave">
          <WaveDivider fill="var(--color-yellow)" />
        </div>
        <div className="hero__text">
          <p className="hero__line hero__line--english">Welcome to</p>
          <p className="hero__line hero__line--english hero__line--title">
            Mayura Kannada Sangha
          </p>
          <p className="hero__line hero__line--english">Central Iowa</p>
          <p className="hero__line hero__line--kannada hero__line--title">
            ಮಯೂರ ಕನ್ನಡ ಸಂಘ
          </p>
          <p className="hero__line hero__line--kannada">ಸೆಂಟ್ರಲ್ ಅಯೋವಾ</p>
        </div>
      </div>
    </div>
  );
}

export default HeroVideo;
