import { baseService } from "./baseService";
import { AUTH_TOKEN } from "../config";

const createTranslationResource = async (targetLanguage, sourceLanguage) => {
  const requestData = {
    clientId: 'kudo-staging-payments-auth-client',
    sourceLanguages:[`${sourceLanguage}`],
    targetLanguages: targetLanguage,
    voiceGender: "female"
  };

  try {
    const response = await baseService.post(
      "https://external-api-staging.meetkudo.com/api/v1/translation_resource",
       JSON.stringify(requestData),
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-token": AUTH_TOKEN,
        },
      }
    );
    if (!response.data) {
      throw new Error("Failed to create translation resource");
    }

    return response.data.body.id;
  } catch (error) {
    console.error("Error creating translation resource:", error);
    return null;
  }
};

export default createTranslationResource;
