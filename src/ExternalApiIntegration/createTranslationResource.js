import { useState, useEffect } from "react";
import { baseService } from "./baseService";
import { AUTH_TOKEN } from "../config";

const CreateTranslationResource = () => {
  const [translationResource, setTranslationResource] = useState(null);
  const requestData = {
    clientId: 'kudo-staging-payments-auth-client',
    sourceLanguages:["ENG"],
    targetLanguages: ["CHI"],
    voiceGender: "female"
  };

  useEffect(() => {
    const fetchToken = async () => {
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

        setTranslationResource(response.data.body.id);
      } catch (error) {
        console.error("Error creating translation resource:", error);
      }
    };

    fetchToken();
  }, []);

  return translationResource;
};

export default CreateTranslationResource;
