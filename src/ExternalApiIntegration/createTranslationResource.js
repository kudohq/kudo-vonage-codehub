import { baseService } from "./baseService.js";
import { AUTH_TOKEN } from "../config.js";

const createTranslationResource = async (targetLanguage, sourceLanguage, gender, isMeeting) => {
  const requestData = {
    clientId: "kudo-preprod-payments-auth-client",
    sourceLanguages: isMeeting ? sourceLanguage : [`${sourceLanguage}`],
    targetLanguages: isMeeting ? sourceLanguage : targetLanguage,
    voiceGender: gender,
    allowMultipleSourceLanguages: isMeeting,
  };

  try {
    const response = await baseService.post(
      "https://external-api-preprod.meetkudo.com/api/v1/translation_resource",
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
