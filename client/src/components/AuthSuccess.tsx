import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthSuccess() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/session', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Session check successful:', userData);
          setUser(userData);
          navigate('/dashboard');
        } else {
          console.error('Session check failed:', await response.text());
          navigate('/login?error=' + encodeURIComponent('Authentication failed'));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        navigate('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    checkSession();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Authentication successful</h2>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
