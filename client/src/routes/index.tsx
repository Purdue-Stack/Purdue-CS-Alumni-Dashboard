import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import UploadPreview from '../pages/UploadPreview';
import RequestForm from '../pages/RequestForm';

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
        path: 'admin/upload',
        element: <UploadPreview />,
      },
      {
        path: '/requestform',
        element: <RequestForm />,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);