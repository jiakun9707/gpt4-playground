import { OpenAIChatModels, OpenAIModel } from "@/utils/OpenAI";
import React from "react";
import { useAuth } from "@/context/AuthProvider";

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

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
      const models: Model[] = await fetch("https://chatgptproxyapi-3jh.pages.dev/v1/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data);

      const models_id = models.map(item => item.id);

      // Get the models that can interface with the chat API and return
      const chatModels = models_id
        .filter((model) => model in OpenAIChatModels)
        .map((model) => OpenAIChatModels[model as keyof typeof OpenAIChatModels])
        .sort((a, b) => (b.maxLimit || 0) - (a.maxLimit || 0)); // Sort by max limit
      console.log(chatModels);
      setModels(chatModels || []);
      setLoadingModels(false);
    };

    fetchModels();
  }, [token]);

  return { models, loadingModels };
}
