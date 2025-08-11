import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import App from './App.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import { MainLayout } from './layouts/MainLayout.tsx'
import { HomePage } from './pages/home/HomePage.tsx'
import { Login } from './components/Login.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { Register } from './components/Register.tsx'
import { DashboardPage } from './pages/dashboard/DashboardPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
