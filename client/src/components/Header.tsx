import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useViewport } from '../hooks/useViewport';

const Header = () => {
  const { authMode, beginSamlLogin, isAdmin, isLoggedIn, loading, login, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isTablet, isMobile } = useViewport();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = async () => {
    if (authMode === 'saml') {
      const from = (location.state as { from?: string } | null)?.from;
      beginSamlLogin(from ?? `${location.pathname}${location.search}`);
      return;
    }

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
      window.alert('Login failed. Check the configured credentials or auth mode, then make sure the backend server was restarted.');
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

  const navLinks = [
    { label: 'Home', to: '/', show: true },
    { label: 'Career Outcomes', to: '/dashboard', show: true },
    { label: 'Alumni Directory', to: '/alumni-directory', show: isLoggedIn },
    { label: 'Mentor Explorer', to: '/mentors', show: isLoggedIn },
    { label: 'Admin', to: '/admin/upload', show: isAdmin }
  ].filter((link) => link.show);

  const quickLinks = [
    { label: 'Home', to: '/', show: true },
    { label: 'Dashboard', to: '/dashboard', show: true },
    { label: 'Alumni Directory', to: '/alumni-directory', show: isLoggedIn },
    { label: 'Mentors', to: '/mentors', show: isLoggedIn },
    { label: 'Admin', to: '/admin/upload', show: isAdmin }
  ].filter((link) => link.show);

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
              <ul role="menu" style={isMobile ? { flexDirection: 'row', overflowX: 'auto', gap: 14, paddingBottom: 4 } : undefined}>
                {quickLinks.map((link) => (
                  <li key={link.to} role="none" style={isMobile ? { width: 'auto', flex: '0 0 auto', marginRight: 0 } : undefined}>
                    <Link role="menuitem" to={link.to}>{link.label}</Link>
                  </li>
                ))}
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
      <nav className="header__mainNav container" style={isTablet ? { opacity: 1 } : undefined}>
        {isTablet && (
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMenuOpen((current) => !current)}
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '0.85rem 1rem' : '0.85rem 0',
              background: '#000',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.3
            }}
          >
            Menu
            <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{menuOpen ? '−' : '+'}</span>
          </button>
        )}
        <section
          id="site-mobile-nav"
          className="header__mainNav--main"
          style={isTablet ? {
            display: menuOpen ? 'flex' : 'none',
            height: 'auto',
            overflow: 'visible',
            width: '100%',
            maxWidth: 'none'
          } : undefined}
        >
          <ul role="menubar" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <li key={link.to} role="none">
                <Link role="menuitem" to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
              </li>
            ))}
            <li role="none" style={{ marginLeft: isTablet ? 0 : 'auto' }}>{renderAuthLink()}</li>
          </ul>
        </section>
      </nav>
    </header>
  );
};

export default Header;
