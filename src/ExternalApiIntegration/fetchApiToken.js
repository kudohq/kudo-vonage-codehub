import { useState, useEffect } from 'react';
import { baseService } from "./baseService";

const FetchApiToken = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await baseService.post('https://auth.preprod.meetkudo.com/api/sso/v1/oauth2/token',
        {
          client_id: 'kudo-preprod-payments-auth-client',
          client_secret: 'CqHHVKZOJ843Bb8fxA5Ug0wrUx1sBlM1wO7JLkdz0cQ='
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
        );
        if (!response.data) {
          throw new Error('Failed to fetch token');
        }

        setToken(response.data.access_token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  return token;
}

export default FetchApiToken;
