let lastButtonState = {
  8: false,
  9: false,
  10: false,
  11: false,
  12: false,
  13: false,
  14: false,
  15: false,
};

export default function controller() {

  let button9Pressed = false;
  let button8Pressed = false;
  let button10Pressed = false;
  let button11Pressed = false;
  let button12Pressed = false;
  let button13Pressed = false;
  let button14Pressed = false;
  let button15Pressed = false;

  const colors = [
    '#000000',
    '#ffffff',
    '#0000ff',
    '#00ffff',
    '#ff0000',
    '#ffff00',
    '#00ff00',
    '#ff00ff'
  ];
  
  let currentColorIndex = 0;
  let currentUnusedColorIndex = 0;

  const gamepads = navigator.getGamepads();
  let gamepad = null;

  // 找到第一个已连接的游戏手柄
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepad = gamepads[i];
      break;
    }
  }

  if (gamepad) {
    const buttons = gamepad.buttons;

    // 添加按键处理的函数
    function handleButtonPress(buttonIndex, action) {
      if (buttons[buttonIndex].pressed && !lastButtonState[buttonIndex]) {
        action();
        lastButtonState[buttonIndex] = true; // 更新为按下状态
      } else if (!buttons[buttonIndex].pressed && lastButtonState[buttonIndex]) {
        lastButtonState[buttonIndex] = false; // 更新为松开状态
      }
    }

    if (buttons[4].pressed) {
      document.getElementById('xInterval').value = parseFloat(document.getElementById('xInterval').value) - 0.15;
    }
    if (buttons[6].pressed) {
      document.getElementById('yInterval').value = parseFloat(document.getElementById('yInterval').value) - 0.15;
    }
    if (buttons[5].pressed) {
      document.getElementById('xInterval').value = parseFloat(document.getElementById('xInterval').value) + 0.15;
    }
    if (buttons[7].pressed) {
      document.getElementById('yInterval').value = parseFloat(document.getElementById('yInterval').value) + 0.15;
    }
    if (gamepads[0].axes[0] > 0.5) {
      document.getElementById('xDotSize').value = parseFloat(document.getElementById('xDotSize').value) + 0.3;
    }
    if (gamepads[0].axes[0] < -0.5) {
      document.getElementById('xDotSize').value = parseFloat(document.getElementById('xDotSize').value) - 0.3;
    }
    if (gamepads[0].axes[1] > 0.5) {
      document.getElementById('yDotSize').value = parseFloat(document.getElementById('yDotSize').value) - 0.3;
    }
    if (gamepads[0].axes[1] < -0.5) {
      document.getElementById('yDotSize').value = parseFloat(document.getElementById('yDotSize').value) + 0.3;
    }
    if (gamepads[0].axes[2] > 0.5) {
      document.getElementById('xDotUnusedSize').value = parseFloat(document.getElementById('xDotUnusedSize').value) + 0.3;
    }
    if (gamepads[0].axes[2] < -0.5) {
      document.getElementById('xDotUnusedSize').value = parseFloat(document.getElementById('xDotUnusedSize').value) - 0.3;
    }
    if (gamepads[0].axes[3] > 0.5) {
      document.getElementById('yDotUnusedSize').value = parseFloat(document.getElementById('yDotUnusedSize').value) - 0.3;
    }
    if (gamepads[0].axes[3] < -0.5) {
      document.getElementById('yDotUnusedSize').value = parseFloat(document.getElementById('yDotUnusedSize').value) + 0.3;
    }
    if (buttons[1].pressed) {
      document.getElementById('Spacing').value = parseFloat(document.getElementById('Spacing').value) + 0.1;
    }
    if (buttons[2].pressed) {
      document.getElementById('Spacing').value = parseFloat(document.getElementById('Spacing').value) - 0.1;
    }
    
    // 按钮8到按钮15的处理
    handleButtonPress(8, () => {
      const presetSelect = document.getElementById('presetSelect');
      if (presetSelect.selectedIndex > 0) {
        presetSelect.selectedIndex -= 1;
        presetSelect.dispatchEvent(new Event('change'));
      }
    });

    handleButtonPress(9, () => {
      const presetSelect = document.getElementById('presetSelect');
      if (presetSelect.selectedIndex < presetSelect.options.length - 1) {
        presetSelect.selectedIndex += 1;
        presetSelect.dispatchEvent(new Event('change'));
      }
    });

    handleButtonPress(10, () => {
      const fontSelect = document.getElementById('fontSelect');
      if (fontSelect.selectedIndex > 0) {
        fontSelect.selectedIndex -= 1;
        fontSelect.dispatchEvent(new Event('change'));
      }
    });

    handleButtonPress(11, () => {
      const fontSelect = document.getElementById('fontSelect');
      if (fontSelect.selectedIndex < fontSelect.options.length - 1) {
        fontSelect.selectedIndex += 1;
        fontSelect.dispatchEvent(new Event('change'));
      }
    });

    handleButtonPress(12, () => {
      currentColorIndex = colors.indexOf(document.getElementById('dotColor').value);
      document.getElementById('dotColor').value = colors[(currentColorIndex - 1 + colors.length) % colors.length];
    });

    handleButtonPress(13, () => {
      currentColorIndex = colors.indexOf(document.getElementById('dotColor').value);
      document.getElementById('dotColor').value = colors[(currentColorIndex + 1) % colors.length];
    });

    handleButtonPress(14, () => {
      currentUnusedColorIndex = colors.indexOf(document.getElementById('dotUnusedColor').value);
      document.getElementById('dotUnusedColor').value = colors[(currentUnusedColorIndex - 1 + colors.length) % colors.length];
    });

    handleButtonPress(15, () => {
      currentUnusedColorIndex = colors.indexOf(document.getElementById('dotUnusedColor').value);
      document.getElementById('dotUnusedColor').value = colors[(currentUnusedColorIndex + 1) % colors.length];
    });

  }
}
