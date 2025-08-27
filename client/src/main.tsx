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
import { TripOverviewPage } from './pages/trips/TripOverviewPage.tsx'
import { TripItineraryPage } from './pages/trips/TripItineraryPage.tsx'
import { TripBudgetPage } from './pages/trips/TripBudgetPage.tsx'
import { TripChatPage } from './pages/trips/TripChatPage.tsx'
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
        children: [
          {
            path: 'overview',
            element: <ProtectedRoute><TripOverviewPage /></ProtectedRoute>
          },
          {
            path: 'itinerary',
            element: <ProtectedRoute><TripItineraryPage /></ProtectedRoute>
          },
          {
            path: 'budget',
            element: <ProtectedRoute><TripBudgetPage /></ProtectedRoute>
          },
          {
            path: 'chat',
            element: <ProtectedRoute><TripChatPage /></ProtectedRoute>
          }
        ]
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
