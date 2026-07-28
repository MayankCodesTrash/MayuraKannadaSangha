import { useEffect, useRef } from 'react';
import { getScrubProgress } from '../utils/scroll.js';
import './Hero.css';

function Hero() {
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

    // iOS Safari never decodes/renders a video frame until playback has
    // actually started at least once - setting `currentTime` alone leaves
    // it blank. Priming with a play() immediately followed by pause()
    // forces it to render, after which scroll-driven seeking works.
    function primeVideo() {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => video.pause()).catch(() => {});
      }
    }

    if (video.readyState >= 3) {
      primeVideo();
    } else {
      video.addEventListener('canplay', primeVideo, { once: true });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      video.removeEventListener('canplay', primeVideo);
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hero" ref={containerRef}>
      <div className="hero__video-wrap" />
      <div className="hero__pin">
        <video
          ref={videoRef}
          className="hero__video"
          muted
          playsInline
          autoPlay
          preload="auto"
        >
          <source src="/videos/0709.mp4" type="video/mp4" />
        </video>
        <div className="hero__tint" />
        <div className="hero__scrim" />
        <div className="hero__text">
          <p className="hero__line hero__line--english">Welcome to</p>
          <p className="hero__line hero__line--english hero__line--title">
            <span className="mks-highlight">M</span>ayura{' '}
            <span className="mks-highlight">K</span>annada{' '}
            <span className="mks-highlight">S</span>angha
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

export default Hero;
