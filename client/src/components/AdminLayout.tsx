import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/icons/upload-data.svg';
import moderateIcon from '../assets/icons/moderate-entries.svg';
import analyticsIcon from '../assets/icons/analytics.svg';
import userIcon from '../assets/icons/user-permissions.svg';
import styles from '../styles/AdminLayout.module.css';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { path: '/admin/upload', label: 'Upload Data', icon: uploadIcon },
        { path: '/admin/moderate', label: 'Moderate Entries', icon: moderateIcon },
        { path: '/admin/analytics', label: 'Analytics', icon: analyticsIcon },
        { path: '/admin/users', label: 'User Permissions', icon: userIcon },
    ];

  return (
    <div className={styles['admin-page']}>
      {/* Sidebar */}
        <aside className={styles.sidebar}>
            <ul>
                {links.map((link) => (
                <li
                    key={link.path}
                    className={location.pathname === link.path ? styles.active : ''}
                    onClick={() => navigate(link.path)}
                    style={{ cursor: 'pointer' }}
                >
                    <img src={link.icon} alt="" className={styles['sidebar-icon']} />
                    <div>{link.label}</div>
                </li>
                ))}
            </ul>
        </aside>

      {/* Main content */}
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
