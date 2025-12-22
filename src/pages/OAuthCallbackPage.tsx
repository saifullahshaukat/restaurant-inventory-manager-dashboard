import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error, { replace: true });
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(user, token);
        
        // Small delay to ensure auth state updates
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        navigate('/login?error=invalid_data', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
    </div>
  );
};

export default OAuthCallbackPage;
