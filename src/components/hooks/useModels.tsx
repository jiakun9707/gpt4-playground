import { OpenAIChatModels, OpenAIModel } from "@/utils/OpenAI";
import React from "react";
import { useAuth } from "@/context/AuthProvider";

/*
  Simple hook to fetch models from the API
*/
export default function useModels() {
  const { token } = useAuth();
  const [models, setModels] = React.useState<OpenAIModel[]>([]);
  const [loadingModels, setLoadingModels] = React.useState(false);

  React.useEffect(() => {    
    if (!token) {
      return setModels(Object.values(OpenAIChatModels));
    };

    const fetchModels = async () => {
      setLoadingModels(true);
      const models = await fetch("https://chatgptproxyapi-3jh.pages.dev/v1/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data);

      console.log("models:", models);

      setModels(models || []);
      setLoadingModels(false);
    };

    fetchModels();
  }, [token]);

  return { models, loadingModels };
}
