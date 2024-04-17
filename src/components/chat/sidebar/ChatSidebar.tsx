import Link from "next/link";
import React from "react";
import { MdAdd, MdDeleteOutline, MdBuild } from "react-icons/md";
import { useOpenAI } from "@/context/OpenAIProvider";
import Github from "../../misc/Github";
import ThemeButton from "./buttons/ThemeButton";
import ButtonContainer from "./buttons/ButtonContainer";
import Conversations from "./conversation/Conversations";
import ApiKey from "./buttons/ApiKey";
import CurrentModel from './buttons/CurrentModel';
import ExportDataComponent from "@/components/data/ExportData";
import ImportDataComponent from "@/components/data/ImportData";
import { useLocalStorageData } from "@/components/hooks/useLocalStorageData";

type Props = {};

export default function ChatSidebar({}: Props) {
  const { clearConversations } = useOpenAI();
  const chatData = useLocalStorageData("pg-history");
  return (
    <div className="dark left-0 top-0 h-full max-h-screen flex-col bg-gray-900 text-primary md:fixed md:flex md:w-[260px]">
      <div className="flex h-full flex-col items-stretch p-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded border border-white/20 p-4 transition-colors hover:bg-gray-500/10"
        >
          <MdAdd />
          New chat
        </Link>

        <Conversations />

        <div className="flex flex-col gap-y-2 border-y border-white/10 py-2">
          <div className="flex flex-col border-b border-white/10 gap-y-2">
            <CurrentModel />
            <ApiKey />
          </div>
          <Link
            className="flex items-center gap-3 rounded p-3 transition-colors hover:bg-gray-500/10"
            href="/playground"
          >
            <MdBuild />
            Playground
          </Link>

          <RollComponent clearConversations={clearConversations} chatData={chatData} />
        </div>

        <Github />
        <span className="text-center text-primary/80">
          Made with ❤️ by Nashex
        </span>
      </div>
    </div>
  );
}

// 定义 Props 类型
interface RollComponentProps {
  clearConversations: () => void;
  chatData: any; // 请根据实际数据结构定义更精确的类型
}

const RollComponent: React.FC<RollComponentProps> = ({ clearConversations, chatData }) => {
  // 定义内联样式
  const scrollablePanelStyle: React.CSSProperties = {
    height: '100px', // 控制面板的高度
    overflowY: 'auto', // 启用垂直滚动
    border: '1px solid #ccc', // 添加边框
    padding: '10px', // 添加内边距
  };

  return (
    <div style={scrollablePanelStyle}>
      <ButtonContainer onClick={clearConversations}>
        <MdDeleteOutline />
        Clear Conversations
      </ButtonContainer>

      <ExportDataComponent data={chatData} />
      <ImportDataComponent onDataImported={(data: any) => console.log(data)} />

      <ThemeButton />
    </div>
  );
};