import { Navigate, createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import UploadPreview from '../pages/UploadPreview';
import AdminLayout from '../components/AdminLayout';
import AdminAlumniTable from '../pages/AdminAlumniTable';
import Dashboard from '../pages/Dashboard';
import AlumniDirectory from '../pages/AlumniDirectory';
import MentorExplorer from '../pages/MentorExplorer';
import AdminAnalytics from '../pages/AdminAnalytics';
import AdminMentorApprovals from '../pages/AdminMentorApprovals';
import { appBasePath } from '../config/runtime';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'alumni-directory',
        element: <AlumniDirectory />,
      },
      {
        path: 'mentors',
        element: <MentorExplorer />,
      },
      {
        path: 'internships',
        element: <Navigate to="/alumni-directory?tab=Internship" replace />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            path: 'upload',
            element: <UploadPreview />,
          },
          {
            path: 'moderate',
            element: <AdminAlumniTable />,
          },
          {
            path: 'mentor-approvals',
            element: <AdminMentorApprovals />,
          },
          {
            path: 'analytics',
            element: <AdminAnalytics />,
          }
        ]
      }
    ],
  },
], {
  basename: appBasePath,
});
