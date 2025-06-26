const Header = () => {
  return (
      <header className="header container">
        <section className="header__goldBar container">
          <div className="header__goldBar--inner">
            <button aria-haspopup="true" className="header__goldBar--moButton" aria-expanded="false">
              <i className="fas fa-bars" aria-hidden="true"></i>&nbsp;
              Quick Links
            </button>
            <section className="header__goldBar--menus">
              <nav className="header__goldBar__findInfoFor">
                <button aria-haspopup="true" aria-expanded="false">
                  Find Info For
                  <span><i className="fas fa-chevron-down"></i></span>
                </button>
                <span>Find Info For</span>
                <ul id="findInfoFor" role="menu">
                  <li role="none"><a href="https://www.purdue.edu/purdue/academics/index.php" role="menuitem">Academics</a>
                  </li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/admissions/index.php" role="menuitem">Admissions</a>
                  </li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/current_students/index.php" role="menuitem">Current
                      Students</a></li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/athletics/index.php" role="menuitem">Athletics</a>
                  </li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/about/index.php" role="menuitem">About</a></li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/careers/index.php" role="menuitem">Careers</a></li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/prospective_students/index.php" role="menuitem">Prospective Students</a></li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/research/index.php" role="menuitem">Research and
                      Partnerships</a></li>
                  <li role="none"><a href="https://www.purdue.edu/purdue/commercialization/index.php" role="menuitem">Entrepreneurship and Commercialization</a></li>
                </ul>
              </nav>
              <nav className="header__goldBar__quickLinks">
                <span>Quick Links</span>
                <ul role="menu">
                  <li role="none"><a role="menuitem" href="https://www.purdue.edu/purdue/admissions/index.html">Apply</a></li>
                  <li role="none"><a role="menuitem" href="https://www.purdue.edu/newsroom/">News</a></li>
                  <li role="none"><a role="menuitem" href="https://www.purdue.edu/president/">President</a></li>
                  <li role="none"><a role="menuitem" href="https://www.purdueofficialstore.com/">Shop</a></li>
                  <li role="none"><a role="menuitem" href="https://www.purdue.edu/visit/">Visit</a></li>
                  <li role="none"><a role="menuitem" href="https://securelb.imodules.com/s/1461/research/hybrid/index.aspx?sid=1461&amp;gid=1010&amp;pgid=1754&amp;cid=4045">Give</a>
                  </li>
                  <li role="none"><a role="menuitem" href="https://www.purdue.edu/ea">Emergency</a></li>
                </ul>
              </nav>
            </section>
            <button className="header__goldBar__search" aria-haspopup="true" aria-expanded="false"><i className="fas fa-search" aria-hidden="true"></i></button>
            <span className="sr-only">Search</span>
            <section id="searchDropdown" className='header__goldBar__search--dropdown'>
              <div className='header__goldBar__search--container'>
                <div className="form-group">
                  <div
                    id="cse-search-form"
                    dangerouslySetInnerHTML={{
                      __html: `<gcse:searchbox-only resultsUrl="https://www.purdue.edu/purdue/search.php" queryParameterName="q">Loading</gcse:searchbox-only>`
                    }}
                  />
                </div>
              </div>
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
              <a id="siteName" href="#">Department of Computer Science</a>
              <div id="siteTagline">
                <a href="/">Alumni Dashboard</a>
              </div>
            </article>
          </section>
        </section>
        <nav className="header__mainNav container">
          <button id="mainNavMo" aria-haspopup="true" aria-expanded="false">
            <i className="fas fa-bars" aria-hidden="true"></i>
            Menu
          </button>
          <section className="header__mainNav--main">
            <ul role='menubar' aria-label="Main Navigation">
              <li role="none"><a role='menuitem' href="/">Home</a></li>
              <li role="none"><a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button" href="../college/college-mixed.html">College<span><i className="fas fa-chevron-down"></i></span></a>
                <ul role='menu' className="header__mainNav--dropdownOuter">
                  <li role="none"><a role='menuitem' href="../college/college-mixed.html">Mixed Tiles Example</a>
                  </li>
                  <li role="none"><a role='menuitem' href="../college/college-test.html">Big tile Example</a></li>
                  <li role="none">
                    <a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button--inner dropdown-button" href="../college/college-audience-1.html">Audience Tiles<span><i
                          className="fas fa-chevron-right"></i></span></a>
                    <ul role='menu' className="header__mainNav--dropdownInner">
                      <li role="none"><a role='menuitem' href="../college/college-audience-1.html">Audience Tiles
                          Example 1</a></li>
                      <li role="none"><a role='menuitem' href="../college/college-audience-2.html">Audience Tiles
                          Example 2</a></li>
                    </ul>
                  </li>
                  <li role="none"><a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button--inner dropdown-button" href="../college/college-news-1.html">News
                      Tiles<span><i className="fas fa-chevron-right"></i></span></a>
                    <ul role='menu' className="header__mainNav--dropdownInner">
                      <li role="none"><a role='menuitem' href="../college/college-news-1.html">News Tiles Example
                          1</a></li>
                      <li role="none"><a role='menuitem' href="../college/college-news-2.html">News Tiles Example
                          2</a></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li role="none"><a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button" href="../office/office-tiles-2.html">Department/Office<span><i
                      className="fas fa-chevron-down"></i></span></a>
                <ul role='menu' className="header__mainNav--dropdownOuter">
                  <li role="none"><a role='menuitem' href="../office/office-tiles-2.html">Department/Office 2
                      tiles</a></li>
                  <li role="none"><a role='menuitem' href="../office/office-tiles-3.html">Department/Office 3
                      tiles</a></li>
                  <li role="none"><a role='menuitem' href="../office/office-tiles-4.html">Department/Office 4
                      tiles</a></li>
                  <li role="none"><a role='menuitem' href="../office/office-tabs.html">Department/Office tabs</a>
                  </li>
                </ul>
              </li>
              <li role="none"><a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button" href="../audience/audience-1.html">Audience<span><i className="fas fa-chevron-down"></i></span></a>
                <ul role='menu' className="header__mainNav--dropdownOuter">
                  <li role="none"><a role='menuitem' href="../audience/audience-1.html">Audience option 1</a></li>
                  <li role="none"><a role='menuitem' href="../audience/audience-2.html">Audience option 2</a></li>
                  <li role="none"><a role='menuitem' href="../audience/audience-3.html">Audience option 3</a></li>
                </ul>
              </li>
              <li role="none"><a role='menuitem' href="../content.html">Content</a></li>
              <li role="none"><a role='menuitem' href="../blank.html">Blank</a></li>
              <li role="none"><a role="menuitem" aria-haspopup="true" aria-expanded="false" className="dropdown-button" href="../components/accordion.html">Web Components<span><i
                      className="fas fa-chevron-down"></i></span></a>
                <ul role='menu' className="header__mainNav--dropdownOuter">
                  <li role="none"><a role='menuitem' href="../components/accordion.html">Accordion</a></li>
                  <li role="none"><a role='menuitem' href="../components/button.html">Button</a></li>
                  <li role="none"><a role='menuitem' href="../components/typography.html">Typography</a></li>
                </ul>
              </li>
            </ul>
          </section>
        </nav>
      </header>
  );
};

export default Header;