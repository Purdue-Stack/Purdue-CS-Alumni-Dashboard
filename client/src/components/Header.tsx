import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header container">
      <section className="header__goldBar container">
        <div className="header__goldBar--inner">
          <section className="header__goldBar--menus">
            <nav className="header__goldBar__quickLinks">
              <span>Quick Links</span>
              <ul role="menu">
                <li role="none"><Link role="menuitem" to="/">Home</Link></li>
                <li role="none"><Link role="menuitem" to="/dashboard">Dashboard</Link></li>
                <li role="none"><Link role="menuitem" to="/alumni-directory">Alumni Directory</Link></li>
                <li role="none"><Link role="menuitem" to="/mentors">Mentors</Link></li>
                <li role="none"><Link role="menuitem" to="/internships">Internships</Link></li>
                <li role="none"><Link role="menuitem" to="/admin/analytics">Admin</Link></li>
              </ul>
            </nav>
          </section>
        </div>
      </section>
      <section className="header__signature container">
        <section className="header__signature--inner">
          <a className="header__signature--logo" id="purdueLogo" href="https://www.purdue.edu" aria-label="Purdue Logo">
            <div>
              <object data="https://www.purdue.edu/purdue/images/PU-H.svg" tabIndex={-1} type="image/svg+xml" aria-labelledby="purdueLogo"></object>
            </div>
          </a>
          <article className="header__signature--siteName">
            <a id="siteName" href="https://www.cs.purdue.edu/">Department of Computer Science</a>
            <div id="siteTagline">
              <Link to="/">Alumni Dashboard</Link>
            </div>
          </article>
        </section>
      </section>
      <nav className="header__mainNav container">
        <section className="header__mainNav--main">
          <ul role="menubar" aria-label="Main Navigation">
            <li role="none"><Link role="menuitem" to="/">Home</Link></li>
            <li role="none"><Link role="menuitem" to="/dashboard">Career Outcomes</Link></li>
            <li role="none"><Link role="menuitem" to="/alumni-directory">Alumni Directory</Link></li>
            <li role="none"><Link role="menuitem" to="/mentors">Mentor Explorer</Link></li>
            <li role="none"><Link role="menuitem" to="/internships">Internship Explorer</Link></li>
            <li role="none"><Link role="menuitem" to="/admin/analytics">Admin</Link></li>
          </ul>
        </section>
      </nav>
    </header>
  );
};

export default Header;
