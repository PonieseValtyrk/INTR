// controller.js

// 扩展 lastState 以包含摇杆和持续按钮的状态
let lastState = {
  buttons: { // 用于单次触发的按钮 (8-15)
    8: false, 9: false, 10: false, 11: false, 12: false, 13: false, 14: false, 15: false,
  },
  continuousButtons: { // 用于持续按下的按钮 (0-7)
     0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false
  },
  axes: { // 用于摇杆状态 (0-3)，存储上次是否超过阈值
    0: { positive: false, negative: false }, // X轴 (左右)
    1: { positive: false, negative: false }, // Y轴 (上下)
    2: { positive: false, negative: false }, // 通常是右摇杆 X
    3: { positive: false, negative: false }  // 通常是右摇杆 Y
  }
};


const colors = [
  '#000000', '#ffffff', '#0000ff', '#00ffff',
  '#ff0000', '#ffff00', '#00ff00', '#ff00ff'
];
let currentColorIndex = 0;
let currentUnusedColorIndex = 0;

// --- 辅助函数 ---

// 更新 DOM 值并触发 input 事件 (模拟用户输入，以便 INTER_v3.js 能响应)
function updateInputValue(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (element) {
    // 检查值是否真的改变，避免不必要的更新和事件触发
    const oldValue = element.type === 'number' ? parseFloat(element.value) : element.value;
    const numericNewValue = typeof newValue === 'number' ? newValue : parseFloat(newValue);

    // 对于数字，进行比较；对于其他类型（如颜色选择器），直接比较字符串
    let changed = false;
    if (element.type === 'number' && !isNaN(numericNewValue)) {
        if (oldValue !== numericNewValue) {
            element.value = numericNewValue;
            changed = true;
        }
    } else if (typeof newValue === 'string' && oldValue !== newValue) {
        element.value = newValue;
        changed = true;
    }

    if (changed) {
      // 触发 input 事件，让 INTER_v3.js 中的监听器知道值已更改
      element.dispatchEvent(new Event('input', { bubbles: true }));
      // 触发 change 事件，用于下拉列表等可能监听 change 的情况
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}


// 处理单次按钮按下 (用于按钮 8-15)
function handleSingleButtonPress(buttons, buttonIndex, action) {
  const isPressed = buttons[buttonIndex]?.pressed; // 安全访问
  if (isPressed && !lastState.buttons[buttonIndex]) {
    action();
    lastState.buttons[buttonIndex] = true; // 更新为按下状态
  } else if (!isPressed && lastState.buttons[buttonIndex]) {
    lastState.buttons[buttonIndex] = false; // 更新为松开状态
  }
}

// 处理持续按钮按下 (用于按钮 0-7)
function handleContinuousButtonPress(buttons, buttonIndex, action) {
    const isPressed = buttons[buttonIndex]?.pressed;
    if (isPressed && !lastState.continuousButtons[buttonIndex]) {
        // 首次按下时执行动作
        action();
        lastState.continuousButtons[buttonIndex] = true;
    } else if (!isPressed && lastState.continuousButtons[buttonIndex]) {
        // 松开时重置状态
        lastState.continuousButtons[buttonIndex] = false;
    }
    // 注意：按钮按住期间不再重复执行 action
}

// 处理摇杆输入
function handleAxisInput(axes, axisIndex, positiveAction, negativeAction) {
    const value = axes[axisIndex] ?? 0; // 安全访问并提供默认值
    const threshold = 0.5;

    // 处理正方向
    if (value > threshold && !lastState.axes[axisIndex].positive) {
        positiveAction();
        lastState.axes[axisIndex].positive = true;
    } else if (value <= threshold && lastState.axes[axisIndex].positive) {
        lastState.axes[axisIndex].positive = false;
    }

    // 处理负方向
    if (value < -threshold && !lastState.axes[axisIndex].negative) {
        negativeAction();
        lastState.axes[axisIndex].negative = true;
    } else if (value >= -threshold && lastState.axes[axisIndex].negative) {
        lastState.axes[axisIndex].negative = false;
    }
    // 注意：摇杆保持在阈值外期间不再重复执行 action
}


// --- 主控制器逻辑 ---
export default function controller() {
  const gamepads = navigator.getGamepads();
  let gamepad = null;

  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepad = gamepads[i];
      break;
    }
  }

  if (gamepad) {
    const buttons = gamepad.buttons;
    const axes = gamepad.axes;

    // --- 更新参数的动作函数 ---
    const decreaseXInterval = () => updateInputValue('xInterval', parseFloat(document.getElementById('xInterval').value) - 0.15);
    const increaseXInterval = () => updateInputValue('xInterval', parseFloat(document.getElementById('xInterval').value) + 0.15);
    const decreaseYInterval = () => updateInputValue('yInterval', parseFloat(document.getElementById('yInterval').value) - 0.15);
    const increaseYInterval = () => updateInputValue('yInterval', parseFloat(document.getElementById('yInterval').value) + 0.15);

    const increaseXDotSize = () => updateInputValue('xDotSize', parseFloat(document.getElementById('xDotSize').value) + 0.3);
    const decreaseXDotSize = () => updateInputValue('xDotSize', parseFloat(document.getElementById('xDotSize').value) - 0.3);
    const decreaseYDotSize = () => updateInputValue('yDotSize', parseFloat(document.getElementById('yDotSize').value) - 0.3); // 注意：原代码这里是减，可能需要确认逻辑
    const increaseYDotSize = () => updateInputValue('yDotSize', parseFloat(document.getElementById('yDotSize').value) + 0.3); // 注意：原代码这里是加

    const increaseXDotUnusedSize = () => updateInputValue('xDotUnusedSize', parseFloat(document.getElementById('xDotUnusedSize').value) + 0.3);
    const decreaseXDotUnusedSize = () => updateInputValue('xDotUnusedSize', parseFloat(document.getElementById('xDotUnusedSize').value) - 0.3);
    const decreaseYDotUnusedSize = () => updateInputValue('yDotUnusedSize', parseFloat(document.getElementById('yDotUnusedSize').value) - 0.3); // 注意：原代码这里是减
    const increaseYDotUnusedSize = () => updateInputValue('yDotUnusedSize', parseFloat(document.getElementById('yDotUnusedSize').value) + 0.3); // 注意：原代码这里是加

    const increaseSpacing = () => updateInputValue('Spacing', parseFloat(document.getElementById('Spacing').value) + 0.1);
    const decreaseSpacing = () => updateInputValue('Spacing', parseFloat(document.getElementById('Spacing').value) - 0.1);

    const increaseRound = () => updateInputValue('round', parseFloat(document.getElementById('round').value) + 0.4);
    const decreaseRound = () => {
        let currentValue = parseFloat(document.getElementById('round').value);
        updateInputValue('round', Math.max(0, currentValue - 0.4)); // 保证不低于0
    };

    // --- 绑定持续输入 ---
    handleContinuousButtonPress(buttons, 4, decreaseXInterval); // L1
    handleContinuousButtonPress(buttons, 5, increaseXInterval); // R1
    handleContinuousButtonPress(buttons, 6, decreaseYInterval); // L2
    handleContinuousButtonPress(buttons, 7, increaseYInterval); // R2

    handleContinuousButtonPress(buttons, 1, increaseSpacing);   // 通常是 'X' 或 'A'
    handleContinuousButtonPress(buttons, 2, decreaseSpacing);   // 通常是 'Square' 或 'X'
    handleContinuousButtonPress(buttons, 3, increaseRound);     // 通常是 'Triangle' 或 'Y'
    handleContinuousButtonPress(buttons, 0, decreaseRound);     // 通常是 'Circle' 或 'B'

    // --- 绑定摇杆输入 ---
    handleAxisInput(axes, 0, increaseXDotSize, decreaseXDotSize); // 左摇杆 X
    handleAxisInput(axes, 1, decreaseYDotSize, increaseYDotSize); // 左摇杆 Y (注意 +/- 方向可能需要根据实际效果调整)
    handleAxisInput(axes, 2, increaseXDotUnusedSize, decreaseXDotUnusedSize); // 右摇杆 X
    handleAxisInput(axes, 3, decreaseYDotUnusedSize, increaseYDotUnusedSize); // 右摇杆 Y (注意 +/- 方向)


    // --- 绑定单次触发按钮 (8-15) ---
    handleSingleButtonPress(buttons, 8, () => { // 通常是 Select/Back
      const presetSelect = document.getElementById('presetSelect');
      if (presetSelect.selectedIndex > 0) {
        presetSelect.selectedIndex -= 1;
        presetSelect.dispatchEvent(new Event('change')); // 触发 change 让 INTER_v3 响应
      }
    });

    handleSingleButtonPress(buttons, 9, () => { // 通常是 Start
      const presetSelect = document.getElementById('presetSelect');
      if (presetSelect.selectedIndex < presetSelect.options.length - 1) {
        presetSelect.selectedIndex += 1;
        presetSelect.dispatchEvent(new Event('change'));
      }
    });

    handleSingleButtonPress(buttons, 10, () => { // 通常是左摇杆按下 L3
      const fontSelect = document.getElementById('fontSelect');
      if (fontSelect.selectedIndex > 0) {
        fontSelect.selectedIndex -= 1;
        fontSelect.dispatchEvent(new Event('change'));
      }
    });

    handleSingleButtonPress(buttons, 11, () => { // 通常是右摇杆按下 R3
      const fontSelect = document.getElementById('fontSelect');
      if (fontSelect.selectedIndex < fontSelect.options.length - 1) {
        fontSelect.selectedIndex += 1;
        fontSelect.dispatchEvent(new Event('change'));
      }
    });

    handleSingleButtonPress(buttons, 12, () => { // 通常是 D-Pad Up
      currentColorIndex = colors.indexOf(document.getElementById('dotColor').value);
      updateInputValue('dotColor', colors[(currentColorIndex - 1 + colors.length) % colors.length]);
    });

    handleSingleButtonPress(buttons, 13, () => { // 通常是 D-Pad Down
      currentColorIndex = colors.indexOf(document.getElementById('dotColor').value);
      updateInputValue('dotColor', colors[(currentColorIndex + 1) % colors.length]);
    });

    handleSingleButtonPress(buttons, 14, () => { // 通常是 D-Pad Left
      currentUnusedColorIndex = colors.indexOf(document.getElementById('dotUnusedColor').value);
      updateInputValue('dotUnusedColor', colors[(currentUnusedColorIndex - 1 + colors.length) % colors.length]);
    });

    handleSingleButtonPress(buttons, 15, () => { // 通常是 D-Pad Right
      currentUnusedColorIndex = colors.indexOf(document.getElementById('dotUnusedColor').value);
      updateInputValue('dotUnusedColor', colors[(currentUnusedColorIndex + 1) % colors.length]);
    });

  }
}
