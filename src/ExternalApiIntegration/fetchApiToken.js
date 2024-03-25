import { baseService } from "./baseService.js";

const FetchApiToken = async () => {

  try {
    const response = await baseService.post(
      "https://neru-f4e1ada1-kudo-vonage-dev.apse1.runtime.vonage.cloud/api/sso/v1/oauth2/token",
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

    return response.data.access_token;
  } catch (error) {
    console.error("Error creating auth token:", error);
    return null;
  }
};

export default FetchApiToken;
