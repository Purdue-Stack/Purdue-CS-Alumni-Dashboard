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
import AdminMentorApprovals from '../pages/AdminMentorApprovals';
import { appBasePath } from '../config/runtime';
import { RequireAdmin, RequireAuth } from './RouteGuards';

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
        element: <RequireAuth><AlumniDirectory /></RequireAuth>,
      },
      {
        path: 'mentors',
        element: <RequireAuth><MentorExplorer /></RequireAuth>,
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
        element: <RequireAdmin><AdminLayout /></RequireAdmin>,
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
          }
        ]
      }
    ],
  },
], {
  basename: appBasePath,
});
