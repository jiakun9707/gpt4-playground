import React, { useState } from 'react';

interface ToggleButtonProps {
    labelOn?: string;  // 按钮开启时显示的文本
    labelOff?: string; // 按钮关闭时显示的文本
    initialActive?: boolean; // 初始激活状态
    onToggle?: (isActive: boolean) => void; // 切换时的回调函数
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    labelOn = 'On',
    labelOff = 'Off',
    initialActive = false,
    onToggle
}) => {
    const [isActive, setIsActive] = useState(initialActive);

    const handleToggle = () => {
        const newActiveState = !isActive;
        setIsActive(newActiveState);
        if (onToggle) {
            onToggle(newActiveState);
        }
    };

    return (
        <button onClick={handleToggle} style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            color: '#fff', 
            backgroundColor: isActive ? 'green' : 'gray', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            outline: 'none'
        }}>
            {isActive ? labelOn : labelOff}
        </button>
    );
};

export default ToggleButton;
