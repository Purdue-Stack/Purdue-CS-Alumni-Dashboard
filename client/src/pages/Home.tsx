// Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Home.css';
import heroVideo from '../assets/videos/graduation.mp4';

//exploration images
import salaryImg from '../assets/images/salary.png';

//alumni images
import alumni1 from '../assets/images/alumni1.jpg';

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
  { name: 'Jamie Lee', company: 'Microsoft Research', img: alumni1, link: '/alumni/jamie' },
  { name: 'Priya Patel', company: 'Amazon', img: alumni1, link: '/alumni/priya' },
  { name: 'Carlos Ruiz', company: 'Tesla', img: alumni1, link: '/alumni/carlos' }
];


const Home: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // exploration section state
  const [activeExploration, setActiveExploration] = useState(explorations[0].key);
  const active = explorations.find(e => e.key === activeExploration)!;

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
        <h2 className="exploration__heading">Choose Exploration</h2>
        <div className="exploration__cards">
          {explorations.map((exp) => (
            <div key={exp.key} className="exploration__card">
              <img
                src={exp.image}
                alt={exp.title}
                className="exploration__card-image"
              />
              <div className="exploration__card-info">
                <h3>{exp.title}</h3>
                <p>{exp.description}</p>
                <a href={exp.link} className="btn btn--explore">
                  Explore →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="alumni-stories">
        <h2 className="alumni-stories__heading">See Alumni Stories</h2>
        <div className="alumni-stories__grid">
          {stories.map((story, i) => (
            <div key={i} className="story-card">
              <img src={story.img} alt={story.name} />
              <div className="story-card__content">
                <h3>{story.name}</h3>
                <p>{story.company}</p>
                <a href={story.link} className="story-card__link">→</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;