// Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';
import heroVideo from '../assets/videos/graduation.mp4';
import { fetchHomeStats } from '../api/api';
import { useAuth } from '../auth/AuthContext';

import salaryImg from '../assets/images/salary.jpg';
import userPlaceholder from '../assets/images/user-placeholder.png';

const condensedFontFamily = 'acumin-pro-condensed, "Franklin Gothic", sans-serif';
const bodyFontFamily = 'acumin-pro, "Franklin Gothic", sans-serif';

const defaultStats = [
  { number: "0", label: "Alumni Tracked" },
  { number: "$0", label: "Average Salary" },
  { number: "0", label: "Approved Mentors" },
];

const explorations = [
  {
    key: 'salary',
    title: 'Salary',
    image: salaryImg,
    description:
      'Explore the diverse salary ranges our graduates earn across different job titles, industries, and employers.',
    link: '/dashboard?tab=Salary&graph=0'
  },
  { key: 'company', title: 'Placements', image: salaryImg, description: 'See where our alumni are working—Big Tech, startups, consulting, and more.', link: '/dashboard?tab=Placements&graph=0' },
  { key: 'internship', title: 'Internship', image: salaryImg, description: 'Discover top internship destinations that launched careers.', link: '/dashboard?tab=Internship&graph=0' },
  { key: 'geographical', title: 'Outcome', image: salaryImg, description: 'Visualize the career outcomes of our alumni.', link: '/dashboard?tab=Outcome&graph=0' },
  { key: 'gradschool', title: 'Graduate School', image: salaryImg, description: 'Learn which top graduate programs our alumni attend.', link: '/dashboard?tab=Graduate%20School&graph=0' }
];

const stories = [
  { name: 'Snehal Antani', company: '2023 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/DSA-2023-3.png', link: 'https://www.cs.purdue.edu/alumni/2023-alumni-awards.html', objectPosition: 'left center' },
  { name: 'Peeyush Ranjan', company: '2022 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/peeyush_ranjan_web.jpg', link: 'https://www.cs.purdue.edu/alumni/2022-alumni-awards.html', objectPosition: 'left center' },
  { name: 'Darwin Ling', company: '2021 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/ling1.jpg', link: 'https://www.cs.purdue.edu/alumni/2021-alumni-awards.html', objectPosition: 'right center' },
  { name: 'Anne-Marie Buibish', company: '2019 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/Buibish.jpeg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus_2019.html' },
  { name: 'Alan Hevner', company: '2018 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/hevner.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus.html' },
  { name: 'Brad Surak', company: '2017 Distinguished Alumnus', img: userPlaceholder, link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2017.html' },
  { name: 'Peng-Siu Mei', company: '2016 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/Peng-Siu%20Mei%20Headshot.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2016.html' },
  { name: 'Lee Congdon', company: '2015 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/Lee%20Congdon.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2015.html' },
  { name: 'Anne Schowe', company: '2014 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/anne-schowe.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2014.html' },
  { name: 'Dr. Lawrence Landweber', company: '2013 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/landweber.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2013.html' },
  { name: 'Dr. Larry Peterson', company: '2012 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/larry-peterson.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2012.html' },
  { name: 'David Capka', company: '2011 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/capka.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2011.html' },
  { name: 'Thomas "Curtis" Holmes Jr.', company: '2010 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/curtis-holmes.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2010.html' },
  { name: 'Dr. Stuart Zweben', company: '2009 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/zweben.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2009.html' },
  { name: 'Dr. Daniel Reed', company: '2008 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/reed.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2008.html' },
  { name: 'Dr. William Nylin', company: '2007 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/william-nylin.JPG', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2007.html' },
  { name: 'Dr. Dorothy E. Denning', company: '2006 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/dorothy-denning.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2006.html' },
  { name: 'Curtis Worsey', company: '2005 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/curtis-worsey.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2005.html' },
  { name: 'Dr. David K. Schrader', company: '2004 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/dave-schrader.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2004.html' },
  { name: 'Beatrice Yormark', company: '2003 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/beatrice-yormark.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2003.html' },
  { name: 'H. Richard Lawson', company: '2002 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/richard-lawson.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2002.html' },
  { name: 'Dr. Michael C. Thurk', company: '2001 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/michael-thurk.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2001.html' },
  { name: 'Dr. Michael Farmwald', company: '2000 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/michael-farmwald.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-2000.html' },
  { name: 'Dr. Stephen J. Tolopka', company: '1999 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/Tolopka.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1999.html', objectPosition: 'right center' },
  { name: 'Dr. Subhash Agrawal', company: '1998 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/subhash-agrawal.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1998.html' },
  { name: 'Dr. Dennis M. Conti', company: '1997 Distinguished Alumnus', img: userPlaceholder, link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1997.html' },
  { name: 'Brian G. Waters', company: '1996 Distinguished Alumnus', img: userPlaceholder, link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1996.html' },
  { name: 'Dr. Kevin C. Kahn', company: '1995 Distinguished Alumnus', img: 'https://www.cs.purdue.edu/alumni/images/kevin-kahn.jpg', link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1995.html' },
  { name: 'Lorie L. Strong', company: '1994 Distinguished Alumnus', img: userPlaceholder, link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1994.html' },
  { name: 'Dr. Thomas J. Aird', company: '1993 Distinguished Alumnus', img: userPlaceholder, link: 'https://www.cs.purdue.edu/alumni/distinguished-alumnus-1993.html' }
];


const Home: React.FC = () => {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const explorationBackground = '#CFB991';
  const explorationAccent = '#2D2926';
  const explorationText = '#2D2926';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(defaultStats);

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

  useEffect(() => {
    let active = true;
    fetchHomeStats()
      .then((data) => {
        if (!active) return;
        setStats([
          { number: data.alumniTracked.toLocaleString(), label: 'Alumni Tracked' },
          { number: `$${data.averageSalary.toLocaleString()}`, label: 'Average Salary' },
          { number: data.mentorsAvailable.toLocaleString(), label: 'Approved Mentors' }
        ]);
      })
      .catch((error) => {
        console.error('Failed to fetch home stats:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNavigation = (direction: 'prev' | 'next') => {
    setCurrentIndex((prevIndex) => {
      const newIndex = direction === 'next' 
        ? (prevIndex + 1) % stats.length
        : (prevIndex - 1 + stats.length) % stats.length;
      return newIndex;
    });
  };

  const handleProtectedNavigation = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (isLoggedIn) {
      return;
    }

    event.preventDefault();

    const username = window.prompt('Username');

    if (!username) {
      return;
    }

    const password = window.prompt('Password');

    if (!password) {
      return;
    }

    try {
      await login(username, password);
      navigate(path);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? error.message
        : 'Use student/student or admin/admin.';
      window.alert(`Login failed. ${message}`);
    }
  };

  // const alumniGridRef = useRef<HTMLDivElement>(null);

  // const [canScrollLeft, setCanScrollLeft] = useState(false);
  // const [canScrollRight, setCanScrollRight] = useState(true);

  // const updateScrollButtons = useCallback(() => {
  //   if (alumniGridRef.current) {
  //     const { scrollLeft, scrollWidth, clientWidth } = alumniGridRef.current;
  //     setCanScrollLeft(scrollLeft > 0);
  //     setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  //   }
  // }, []);

  // useEffect(() => {
  //   updateScrollButtons();
  //   const grid = alumniGridRef.current;
  //   if (!grid) return;
  //   grid.addEventListener('scroll', updateScrollButtons);
  //   window.addEventListener('resize', updateScrollButtons);
  //   return () => {
  //     grid.removeEventListener('scroll', updateScrollButtons);
  //     window.removeEventListener('resize', updateScrollButtons);
  //   };
  // }, [updateScrollButtons]);

  // const scrollAlumni = (direction: "left" | "right") => {
  //   if (alumniGridRef.current) {
  //     const card = alumniGridRef.current.querySelector('.story-card');
  //     const cardWidth = card ? (card as HTMLElement).offsetWidth + 32 : 340;
  //     alumniGridRef.current.scrollBy({
  //       left: direction === "right" ? cardWidth : -cardWidth,
  //       behavior: "smooth",
  //     });
  //   }
  // };

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
              <span className="hero__tag-text" style={{ fontFamily: condensedFontFamily }}>SEE THE FUTURE</span>
            </div>
            <h1 className="hero__title" style={{ fontFamily: condensedFontFamily }}>
              EXPLORE ALUMNI SUCCESS
              <span className="hero__subtitle">Visualize Alumni Outcomes, Track Salary & Placement Trends, Support Academic & Career Planning</span>
            </h1>
            <div className="hero__buttons">
              <Link to="/dashboard" onClick={(event) => void handleProtectedNavigation(event, '/dashboard')} className="hero-data-button" style={{ textDecoration: 'none', fontFamily: condensedFontFamily }}>
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
              </Link>
              <Link to="/alumni-directory" onClick={(event) => void handleProtectedNavigation(event, '/alumni-directory')} className="hero-data-button hero-data-button--white" style={{ textDecoration: 'none', fontFamily: condensedFontFamily }}>
                RESOURCES
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
              </Link>
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
                    <h3 className="stats-card__number" style={{ fontFamily: condensedFontFamily }}>{stat.number}</h3>
                    <p className="stats-card__label" style={{ fontFamily: bodyFontFamily }}>{stat.label}</p>
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
      <section className="exploration" style={{ background: explorationBackground }}>
        <div className="exploration__content">
          <div className="exploration__twocol">
            <div className="exploration__list" style={{ borderRight: `2px solid ${explorationAccent}` }}>
              <div
                className="exploration__triangle-separator"
                aria-hidden="true"
                style={{ top: `${activeExplorationIndex * 78 + 80}px` }}
              >
                <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon
                    points="0,0 48,32 0,64"
                    fill="#CFB991"
                    stroke={explorationAccent}
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,0 0,64"
                    stroke="#CFB991"
                    strokeWidth="6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="hero__tag exploration__tag" style={{ background: '#2D2926' }}>
                <span className="hero__tag-text" style={{ color: '#fff', fontFamily: condensedFontFamily }}>CHOOSE EXPLORATION</span>
              </div>
              {explorations.map((exp, idx) => (
                <button
                  key={exp.key}
                  className={`exploration__list-item${activeExplorationIndex === idx ? ' active' : ''}`}
                  onClick={() => setActiveExplorationIndex(idx)}
                  type="button"
                  style={{
                    color: explorationText,
                    textDecorationColor: '#2D2926'
                  }}
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
                <h3 style={{ color: explorationText }}>{active.title}</h3>
                <p style={{ color: explorationText }}>{active.description}</p>
                <Link to={active.link} onClick={(event) => void handleProtectedNavigation(event, active.link)} className="hero-data-button" style={{ background: '#2D2926', color: '#fff', textDecoration: 'none', fontFamily: condensedFontFamily }}>
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
                </Link>
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
          <div className="alumni-stories__grid">
            {stories.map((story) => (
              <a
                key={`${story.company}-${story.name}`}
                className="story-card"
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <img src={story.img} alt={story.name} style={{ objectPosition: story.objectPosition }} />
                <div className="story-card__content">
                  <h3>{story.name}</h3>
                  <p>{story.company}</p>
                  <div className="alumni-stories-button__arrow" aria-hidden="true">
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
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
