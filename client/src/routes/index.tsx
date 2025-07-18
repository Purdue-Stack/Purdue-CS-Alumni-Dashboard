import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import UploadPreview from '../pages/UploadPreview';
import RequestForm from '../pages/RequestForm';
import AdminLayout from '../components/AdminLayout';

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
        path: '/requestform',
        element: <RequestForm />,
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
          }
        ]
      }
    ],
  },
]);