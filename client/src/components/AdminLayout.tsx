import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/icons/upload-data.svg';
import moderateIcon from '../assets/icons/moderate-entries.svg';
import permissionsIcon from '../assets/icons/user-permissions.svg';
import styles from '../styles/AdminLayout.module.css';
import { useViewport } from '../hooks/useViewport';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isMobile } = useViewport();

    const links = [
        { path: '/admin/upload', label: 'Upload Data', icon: uploadIcon },
        { path: '/admin/moderate', label: 'Moderate Entries', icon: moderateIcon },
        { path: '/admin/mentor-approvals', label: 'Mentor Approvals', icon: permissionsIcon },
    ];

  return (
    <div className={styles['admin-page']} style={isMobile ? { display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' } : undefined}>
      {/* Top navigation */}
        <nav className={styles['admin-nav']} aria-label="Admin Navigation" style={isMobile ? { width: '100%', overflowX: 'hidden', flex: '0 0 auto', padding: '16px 12px 0' } : undefined}>
            <ul style={isMobile ? { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, padding: 6, margin: 0, width: '100%' } : undefined}>
                {links.map((link) => (
                <li
                    key={link.path}
                    className={location.pathname === link.path ? styles.active : ''}
                    onClick={() => navigate(link.path)}
                    style={{
                      cursor: 'pointer',
                      ...(isMobile ? {
                        minWidth: 0,
                        padding: '10px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        lineHeight: 1.15,
                        fontSize: 13
                      } : {})
                    }}
                >
                    <img src={link.icon} alt="" className={styles['sidebar-icon']} style={isMobile ? { width: 20, height: 20, marginRight: 0 } : undefined} />
                    <div style={isMobile ? { paddingTop: 0, overflowWrap: 'anywhere' } : undefined}>{link.label}</div>
                </li>
                ))}
            </ul>
        </nav>

      {/* Main content */}
      <div className={styles.main} style={isMobile ? { width: '100%', minWidth: 0, overflowX: 'hidden' } : undefined}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
