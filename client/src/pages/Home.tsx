// Home.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/Home.css';
import heroVideo from '../assets/videos/graduation.mp4';

import salaryImg from '../assets/images/salary.jpg';

import alumni1 from '../assets/images/alumni1.png';
import alumni2 from '../assets/images/alumni2.png';
import alumni3 from '../assets/images/alumni3.png';
import alumni4 from '../assets/images/alumni4.png';
import alumni5 from '../assets/images/alumni5.png';

const stats = [
  { number: "10,000+", label: "Alumni Tracked" },
  { number: "$106,000", label: "Average Salary" },
  { number: "94%", label: "Job Placement" },
];

const explorations = [
  {
    key: 'salary',
    title: 'See Salary Data',
    image: salaryImg,
    description:
      'Explore the diverse salary ranges our graduates earn across different job titles, industries, and top employers—giving you real insight into the earning potential of a Purdue CS degree.',
    link: '/salary'
  },
  { key: 'company', title: 'Company Placements', image: salaryImg, description: 'See where our alumni are working—Big Tech, startups, consulting, and more.', link: '/company' },
  { key: 'internship', title: 'Internship Placements', image: salaryImg, description: 'Discover top internship destinations that launched careers.', link: '/internship' },
  { key: 'geographical', title: 'Geographical Data', image: salaryImg, description: 'Visualize where graduates live and work around the world.', link: '/geographical' },
  { key: 'gradschool', title: 'Graduate School Admissions', image: salaryImg, description: 'Learn which top graduate programs our alumni attend.', link: '/gradschool' }
];

const stories = [
  { name: 'Brody Smith', company: 'Google DeepMind', img: alumni1, link: '/alumni/brody' },
  { name: 'Jamie Lee', company: 'Microsoft Research', img: alumni2, link: '/alumni/jamie' },
  { name: 'Priya Patel', company: 'Amazon', img: alumni3, link: '/alumni/priya' },
  { name: 'Carlos Ruiz', company: 'Tesla', img: alumni4, link: '/alumni/carlos' },
  { name: 'Emily Chen', company: 'Meta', img: alumni5, link: '/alumni/emily' }
];


const Home: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [activeExplorationIndex, setActiveExplorationIndex] = useState(0);
  const active = explorations[activeExplorationIndex];

  const resetInterval = useCallback(() => {
    return setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stats.length);
    }, 3000);
  }, []);

  useEffect(() => {
    const timer = resetInterval();
    return () => clearInterval(timer);
  }, [resetInterval]);

  const handleNavigation = (direction: 'prev' | 'next') => {
    setCurrentIndex((prevIndex) => {
      const newIndex = direction === 'next' 
        ? (prevIndex + 1) % stats.length
        : (prevIndex - 1 + stats.length) % stats.length;
      return newIndex;
    });
  };

  const alumniGridRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (alumniGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = alumniGridRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const grid = alumniGridRef.current;
    if (!grid) return;
    grid.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      grid.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scrollAlumni = (direction: "left" | "right") => {
    if (alumniGridRef.current) {
      const card = alumniGridRef.current.querySelector('.story-card');
      const cardWidth = card ? (card as HTMLElement).offsetWidth + 32 : 340;
      alumniGridRef.current.scrollBy({
        left: direction === "right" ? cardWidth : -cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero__content">
          <div className="hero__left">
            <div className="hero__tag">
              <span className="hero__tag-text">SEE THE FUTURE</span>
            </div>
            <h1 className="hero__title">
              EXPLORE ALUMNI SUCCESS
              <span className="hero__subtitle">Visualize Alumni Outcomes, Track Salary & Placement Trends, Support Academic & Career Planning</span>
            </h1>
            <div className="hero__buttons">
              <a className="hero-data-button">
                EXPLORE DATA
                <svg 
                  className="hero-data-button__arrow" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M14 5L21 12M21 12L14 19M21 12H3" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a className="hero-data-button hero-data-button--white">
                LEARN MORE
                <svg 
                  className="hero-data-button__arrow" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M14 5L21 12M21 12L14 19M21 12H3" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="hero__right">
            <div className="stats-carousel">
              <div 
                className="stats-carousel__track"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="stats-card">
                    <h3 className="stats-card__number">{stat.number}</h3>
                    <p className="stats-card__label">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="stats-carousel__navigation">
                <button 
                  className="stats-carousel__arrow stats-carousel__arrow--prev"
                  onClick={() => handleNavigation('prev')}
                  aria-label="Previous stat"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M19 12H5M12 19l-7-7 7-7" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="stats-carousel__dots">
                  {stats.map((_, index) => (
                    <button
                      key={index}
                      className={`stats-carousel__dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Show stat ${index + 1}`}
                    />
                  ))}
                </div>
                <button 
                  className="stats-carousel__arrow stats-carousel__arrow--next"
                  onClick={() => handleNavigation('next')}
                  aria-label="Next stat"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M5 12h14m-7-7l7 7-7 7" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
      <section className="exploration">
        <div className="exploration__content">
          <div className="exploration__twocol">
            <div className="exploration__list">
              <div
                className="exploration__triangle-separator"
                aria-hidden="true"
                style={{ top: `${activeExplorationIndex * 78 + 80}px` }}
              >
                <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon
                    points="0,0 48,32 0,64"
                    fill="black"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  {/* Overlay a red line on the left edge to hide the white border */}
                  <polyline
                    points="0,0 0,64"
                    stroke="black"
                    strokeWidth="6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="hero__tag exploration__tag">
                <span className="hero__tag-text">CHOOSE EXPLORATION</span>
              </div>
              {explorations.map((exp, idx) => (
                <button
                  key={exp.key}
                  className={`exploration__list-item${activeExplorationIndex === idx ? ' active' : ''}`}
                  onClick={() => setActiveExplorationIndex(idx)}
                  type="button"
                >
                  {exp.title}
                </button>
              ))}
            </div>
            <div className="exploration__details">
              <img
                src={active.image}
                alt={active.title}
                className="exploration__details-image"
              />
              <div className="exploration__details-info">
                <h3>{active.title}</h3>
                <p>{active.description}</p>
                <a className="hero-data-button">
                  EXPLORE
                  <svg
                    className="hero-data-button__arrow"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 5L21 12M21 12L14 19M21 12H3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="alumni-stories">
        <div className="alumni-stories__content">
          <div className="hero__tag alumni-stories__tag">
            <span className="hero__tag-text alumni-stories____tag-text">SEE ALUMNI STORIES</span>
          </div>
          <div className="alumni-stories__tag-line"></div>
          {canScrollLeft && (
            <button
              className="alumni-stories__scroll alumni-stories__scroll--left"
              aria-label="Scroll left"
              onClick={() => scrollAlumni("left")}
            >
              <svg
                className="hero-data-button__arrow"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "scaleX(-1)" }}
              >
                <path
                  d="M14 5L21 12M21 12L14 19M21 12H3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              className="alumni-stories__scroll alumni-stories__scroll--right"
              aria-label="Scroll right"
              onClick={() => scrollAlumni("right")}
            >
              <svg 
                className="hero-data-button__arrow" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M14 5L21 12M21 12L14 19M21 12H3" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div className="alumni-stories__grid" ref={alumniGridRef}>
            {stories.map((story, i) => (
              <div key={i} className="story-card">
                <img src={story.img} alt={story.name} />
                <div className="story-card__content">
                  <h3>{story.name}</h3>
                  <p>{story.company}</p>
                  <div className="alumni-stories-button__arrow">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M14 5L21 12M21 12L14 19M21 12H3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;