import { useState, useEffect } from 'react';
import { baseService } from "./baseService";

const FetchApiToken = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await baseService.post('https://auth.staging.meetkudo.com/api/sso/v1/oauth2/token',
        {
          client_id: 'kudo-staging-payments-auth-client',
          client_secret: 'l/rBtxuW2X6LoPhJl3Uo5DnCCr643e4zE7hCq1lnX+8='
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
