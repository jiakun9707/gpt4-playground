import {
  clearHistory,
  Conversation,
  getHistory,
  storeConversation,
  History,
  deleteConversationFromHistory,
  updateConversation,
} from "@/utils/History";
import {
  defaultConfig,
  OpenAIChatMessage,
  OpenAIConfig,
  OpenAISystemMessage,
  OpenAIChatModels,
  getOpenAICompletion,
  OpenAIRequest
} from "@/utils/OpenAI";
import React, { PropsWithChildren, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthProvider";


const CHAT_ROUTE = "/";

const defaultContext = {
  systemMessage: {
    role: "system",
    content: "You are a helpful AI chatbot.",
  } as OpenAISystemMessage,
  messages: [] as OpenAIChatMessage[],
  config: defaultConfig as OpenAIConfig,
  updateSystemMessage: (content: string) => {},
  addMessage: () => {},
  removeMessage: (id: number) => {},
  conversationName: "",
  conversationId: "",
  deleteConversation: () => {},
  updateConversationName: () => {},
  conversations: {} as History,
  clearConversations: () => {},
  clearConversation: () => {},
  loadConversation: (id: string, conversation: Conversation) => {},
  toggleMessageRole: (id: number) => {},
  updateMessageContent: (id: number, content: string) => {},
  updateConfig: (newConfig: Partial<OpenAIConfig>) => {},
  submit: () => {},
  loading: true,
  error: "",
  chatbotMode: false,
  setChatbotMode: (mode: boolean) => {},
  toggleChatbotMode: () => {},
};

const OpenAIContext = React.createContext<{
  systemMessage: OpenAISystemMessage;
  messages: OpenAIChatMessage[];
  config: OpenAIConfig;
  updateSystemMessage: (content: string) => void;
  addMessage: (
    content?: string,
    submit?: boolean,
    role?: "user" | "assistant"
  ) => void;
  removeMessage: (id: number) => void;
  conversationName: string;
  conversationId: string;
  deleteConversation: (id: string) => void;
  updateConversationName: (id: string, name: string) => void;
  conversations: History;
  clearConversation: () => void;
  clearConversations: () => void;
  loadConversation: (id: string, conversation: Conversation) => void;
  toggleMessageRole: (id: number) => void;
  updateMessageContent: (id: number, content: string) => void;
  updateConfig: (newConfig: Partial<OpenAIConfig>) => void;
  submit: () => void;
  loading: boolean;
  error: string;
  chatbotMode: boolean;
  setChatbotMode: (mode: boolean) => void;
  toggleChatbotMode: () => void;
}>(defaultContext);

export default function OpenAIProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Conversation state
  const [conversations, setConversations] = React.useState<History>(
    {} as History
  );
  const [conversationId, setConversationId] = React.useState<string>("");
  const [conversationName, setConversationName] = React.useState("");
  const [systemMessage, setSystemMessage] = React.useState<OpenAISystemMessage>(
    defaultContext.systemMessage
  );
  const [config, setConfig] = React.useState<OpenAIConfig>(defaultConfig);
  const [messages, setMessages] = React.useState<OpenAIChatMessage[]>([]);

  // Load conversation from local storage
  useEffect(() => {
    setConversations(getHistory());
  }, []);

  const updateSystemMessage = (content: string) => {
    setSystemMessage({
      role: "system",
      content,
    });
  };

  const removeMessage = (id: number) => {
    setMessages((prev) => {
      return [...prev.filter((message) => message.id !== id)];
    });
  };

  const toggleMessageRole = (id: number) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          role: message.role === "user" ? "assistant" : "user",
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const updateConfig = (newConfig: Partial<OpenAIConfig>) => {
    setConfig((prev) => {
      // If model changes set max tokens to half of the model's max tokens
      if (newConfig.model && newConfig.model !== prev.model) {
        newConfig.max_tokens = Math.floor(
          OpenAIChatModels[newConfig.model].maxLimit / 2
        );
      }

      return {
        ...prev,
        ...newConfig,
      };
    });

  };

  const updateMessageContent = (id: number, content: string) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          content,
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const handleStoreConversation = useCallback(() => {
    if (messages.length === 0) return;

    const conversation = {
      name: conversationName,
      systemMessage,
      messages,
      config,
      lastMessage: Date.now(),
    } as Conversation;

    let id = storeConversation(conversationId, conversation);
    setConversationId(id);
    setConversations((prev) => ({ ...prev, [id]: conversation }));

    if (router.pathname === CHAT_ROUTE) router.push(`/chat/${id}`);
  }, [conversationId, messages]);

  useEffect(() => {
    handleStoreConversation();
  }, [messages, systemMessage, config]);

  const loadConversation = (id: string, conversation: Conversation) => {
    setConversationId(id);

    const { systemMessage, messages, config, name } = conversation;

    setSystemMessage(systemMessage);
    setMessages(messages);
    updateConfig(config);
    setConversationName(name);
  };

  const clearConversations = useCallback(() => {
    clearHistory();

    setMessages([]);
    setConversationId("");
    setConversations({});

    router.push("/");
  }, []);

  const clearConversation = () => {
    setMessages([]);
    setSystemMessage(defaultContext.systemMessage);
    setConversationId("");
  };

  const deleteConversation = (id: string) => {
    deleteConversationFromHistory(id);
    setConversations((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });

    if (id === conversationId) clearConversation();
  };

  const updateConversationName = (id: string, name: string) => {
    setConversations((prev) => {
      const conversation = prev[id];
      if (!conversation) return prev;
      return {
        ...prev,
        [id]: {
          ...conversation,
          name,
        },
      };
    });

    if (id === conversationId) setConversationName(name);

    updateConversation(id, { name });
  };

  const submit = useCallback(
    async (messages_: OpenAIChatMessage[] = []) => {
      if (loading) return;
      setLoading(true);

      messages_ = messages_.length ? messages_ : messages;

      try {
        const decoder = new TextDecoder();

        let response;

        if (!messages_ || messages_.length === 0) {
          response = new Response("Missing messages", { status: 400 });
        } else if (!token) {
          response = new Response("Missing token", { status: 401 });
        } else {
          const total_config = {
            model: config.model || defaultConfig.model,
            max_tokens: config.max_tokens || defaultConfig.max_tokens,
            temperature: config.temperature || defaultConfig.temperature,
            top_p: config.top_p || defaultConfig.top_p,
            frequency_penalty: config.frequency_penalty || defaultConfig.frequency_penalty,
            presence_penalty: config.presence_penalty || defaultConfig.presence_penalty,
            stream: true,
            n: 1,
          };
          
          if (!chatbotMode) {
            messages_ = messages.slice(-1);
            if (messages_[0].role !== "user") {
              throw new Error("Role should be user.");
            }
          } 

          const payload: OpenAIRequest = {
            ...total_config,
            messages: [systemMessage, ...messages_].map(
              ({ role, content }) => ({
                role,
                content,
              })
            ),
          };
  
          try {
            const stream = await getOpenAICompletion(token, payload);
            response = new Response(stream);
          } catch (e: any) {
            response = new Response(e.message || "Error fetching response.", {
              status: 500,
            });
          }
        }

        const {body, ok} = response;
        
        if (!body) return;
        const reader = body.getReader();

        if (!ok) {
          // Get the error message from the response body
          const { value } = await reader.read();
          const chunkValue = decoder.decode(value);
          const { error } = JSON.parse(chunkValue);

          throw new Error(
            error?.message ||
              "Failed to fetch response, check your API key and try again."
          );
        }

        let done = false;

        const message = {
          id: messages_.length,
          role: "assistant",
          content: "",
        } as OpenAIChatMessage;

        setMessages((prev) => {
          message.id = prev.length;
          return [...prev, message];
        });

        while (!done) {
          console.log("Reading...", reader);
          // reader.releaseLock();
          const { value, done: doneReading } = await reader.read();
          console.log(value, doneReading);
          done = doneReading;
          const chunkValue = decoder.decode(value);
          message.content += chunkValue;

          updateMessageContent(message.id as number, message.content);
        }
      } catch (error: any) {
        console.error(error);
        setMessages((prev) => {
          return [
            ...prev,
            {
              id: prev.length,
              role: "assistant",
              content: error.message,
            },
          ];
        });
      }

      setLoading(false);
    },
    [config, messages, systemMessage, loading, token]
  );

  const addMessage = useCallback(
    (
      content: string = "",
      submit_: boolean = false,
      role: "user" | "assistant" = "user"
    ) => {
      setMessages((prev) => {
        const messages = [
          ...prev,
          {
            id: prev.length,
            role,
            content: content || "",
          } as OpenAIChatMessage,
        ];
        submit_ && submit(messages);
        return messages;
      });
    },
    [submit]
  );

  const [chatbotMode, setChatbotMode] = React.useState(false);

  const toggleChatbotMode = () => {
    setChatbotMode(!chatbotMode);
  };

  const value = React.useMemo(
    () => ({
      systemMessage,
      messages,
      config,
      loading,
      updateSystemMessage,
      addMessage,
      removeMessage,
      conversationId,
      conversationName,
      updateConversationName,
      deleteConversation,
      loadConversation,
      clearConversation,
      conversations,
      clearConversations,
      toggleMessageRole,
      updateMessageContent,
      updateConfig,
      submit,
      error,
      chatbotMode,
      setChatbotMode,
      toggleChatbotMode,
    }),
    [
      systemMessage,
      messages,
      config,
      loading,
      addMessage,
      submit,
      conversationId,
      conversations,
      clearConversations,
      error,
      chatbotMode,
    ]
  );

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
}

export const useOpenAI = () => React.useContext(OpenAIContext);
