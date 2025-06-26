import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import UploadPreview from '../pages/UploadPreview';

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
        path: '/uploadPreview',
        element: <UploadPreview />,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);