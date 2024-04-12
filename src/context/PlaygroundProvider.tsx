import React, { PropsWithChildren } from "react";

const PlaygroundContext = React.createContext<{
  showConversations: boolean;
  setShowConversations: (show: boolean) => void;
  toggleShowConversations: () => void;
  chatbotMode: boolean;
  setChatbotMode: (mode: boolean) => void;
  toggleChatbotMode: () => void;
}>({
  showConversations: false,
  setShowConversations: (show: boolean) => {},
  toggleShowConversations: () => {},
  chatbotMode: false,
  setChatbotMode: (mode: boolean) => {},
  toggleChatbotMode: () => {},
});

export default function PlaygroundProvider(props: PropsWithChildren) {
  const [showConversations, setShowConversations] = React.useState(false);
  const [chatbotMode, setChatbotMode] = React.useState(false);

  const toggleShowConversations = () => {
    setShowConversations(!showConversations);
  };

  const toggleChatbotMode = () => {
    setChatbotMode(!chatbotMode);
  };

  const value = React.useMemo(() => ({
    showConversations,
    setShowConversations,
    toggleShowConversations,
    chatbotMode,
    setChatbotMode,
    toggleChatbotMode,
  }), [showConversations, chatbotMode]);

  return <PlaygroundContext.Provider {...props} value={value} />;
}

export const usePlayground = () => React.useContext(PlaygroundContext);
