import React, { useState, useEffect } from 'react';

// 定义一个通用的键值对存储接口
interface LocalStorageData {
  [key: string]: any; // 可以根据实际数据类型进一步定义
}


export const useLocalStorageData = (key: string) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    };

    loadData();
  }, [key]);

  return data;
};
