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
import { TripItineraryPage } from './pages/itineraries/TripItineraryPage.tsx'
import { TripBudgetPage } from './pages/budget/TripBudgetPage.tsx'
import { TripChatPage } from './pages/chat/TripChatPage.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { TripLayout } from './layouts/TripLayout.tsx'
import { SearchFlightsPage} from './pages/flights/SearchFlightsPage.tsx';
import { SearchingLayout } from './layouts/SearchingLayout.tsx'
import { FlightResults } from './pages/flights/components/FlightResults.tsx'
import { JoinTripPage } from './pages/trips/JoinTripPage.tsx';
// Import commented out until needed
import {APIProvider} from "@vis.gl/react-google-maps"


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
      },
    ]
  },
    
  {
    path: 'trips',
    element: <TripLayout />,
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
    path: '/search',
    element: <SearchingLayout />,
    children: [
      {
        path: 'flights',
        element: <ProtectedRoute><SearchFlightsPage /></ProtectedRoute>,
      },
      {
        path: 'flights/results',
        element: <ProtectedRoute><FlightResults /></ProtectedRoute>,
      }
    ]
  },

  {
    path: 'trips/join/:token',
    element: <ProtectedRoute><JoinTripPage /></ProtectedRoute>
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
          <APIProvider libraries={['places']} apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <RouterProvider router={router} />
          </APIProvider>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
