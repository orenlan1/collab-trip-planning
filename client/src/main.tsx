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
import { ThemeProvider } from './context/ThemeContext'
import { Register } from './components/Register.tsx'
import { DashboardPage } from './pages/dashboard/DashboardPage.tsx';
import { CreateTripPage } from './pages/trips/CreateTripPage.tsx'
import { SingleTripPage } from './pages/trips/SingleTripPage.tsx'
import { Loader } from 'lucide-react'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { SidebarLayout } from './layouts/SidebarLayout.tsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: (
        <MainLayout />
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'trips/create',
        element: <ProtectedRoute><CreateTripPage /></ProtectedRoute>
      }
    ]
  },
    
  {
    path: 'trips',
    element: <SidebarLayout />,
    children: [
      {
        path: ':tripId',
        element: <ProtectedRoute><SingleTripPage /></ProtectedRoute>
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
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
