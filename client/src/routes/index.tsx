import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import UploadPreview from '../pages/UploadPreview';
import AdminUpload1 from '../pages/AdminUpload1';


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
        path: 'admin/uploadPreview',
        element: <UploadPreview />,
      },
      { path: 'admin/upload', element: <AdminUpload1 /> },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);