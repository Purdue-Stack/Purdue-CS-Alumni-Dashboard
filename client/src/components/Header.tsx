import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Header = () => {
  const { isAdmin, isLoggedIn, loading, login, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async () => {
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
      const from = (location.state as { from?: string } | null)?.from;

      if (from) {
        navigate(from, { replace: true });
      }
    } catch {
      window.alert('Login failed. Use student/student or admin/admin, then make sure the backend server was restarted.');
    }
  };

  const handleLogout = async () => {
    await logout();

    if (
      location.pathname.startsWith('/admin') ||
      location.pathname === '/alumni-directory' ||
      location.pathname === '/internships' ||
      location.pathname === '/mentors'
    ) {
      navigate('/', { replace: true });
    }
  };

  const renderAuthLink = () => (
    loading ? (
      <span role="menuitem" aria-disabled="true">
        Checking...
      </span>
    ) : isLoggedIn ? (
      <a
        href="/"
        role="menuitem"
        onClick={(event) => {
          event.preventDefault();
          void handleLogout();
        }}
      >
        Logout{user ? ` (${user.displayName})` : ''}
      </a>
    ) : (
      <a
        href="/"
        role="menuitem"
        onClick={(event) => {
          event.preventDefault();
          void handleLogin();
        }}
      >
        Login
      </a>
    )
  );

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
                {isLoggedIn && <li role="none"><Link role="menuitem" to="/alumni-directory">Alumni Directory</Link></li>}
                {isLoggedIn && <li role="none"><Link role="menuitem" to="/mentors">Mentors</Link></li>}
                {isAdmin && <li role="none"><Link role="menuitem" to="/admin/upload">Admin</Link></li>}
              </ul>
            </nav>
          </section>
        </div>
      </section>
      <section className="header__signature container">
        <section className="header__signature--inner">
          <a className="header__signature--logo svgLinkContainer" id="purdueLogo" href="https://www.purdue.edu" aria-label="Purdue Logo">
            <div>
              <object
                aria-label="Purdue Logo"
                className="svgContainer"
                data="https://www.purdue.edu/purdue/images/PU-H.svg"
                tabIndex={-1}
                title="Purdue logo"
                type="image/svg+xml"
              >
                <img alt="Purdue University" src="https://www.purdue.edu/purdue/images/PU-H.svg" />
              </object>
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
            {isLoggedIn && <li role="none"><Link role="menuitem" to="/alumni-directory">Alumni Directory</Link></li>}
            {isLoggedIn && <li role="none"><Link role="menuitem" to="/mentors">Mentor Explorer</Link></li>}
            {isAdmin && <li role="none"><Link role="menuitem" to="/admin/upload">Admin</Link></li>}
            <li role="none" style={{ marginLeft: 'auto' }}>{renderAuthLink()}</li>
          </ul>
        </section>
      </nav>
    </header>
  );
};

export default Header;
