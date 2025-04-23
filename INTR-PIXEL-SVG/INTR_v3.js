import controller from './controller.js' 

let fixWidth = document.getElementById('rightBox').offsetWidth
let fixHeight = document.getElementById('rightBox').offsetHeight;

let width = document.getElementById('rightBox').offsetWidth
let height = document.getElementById('rightBox').offsetHeight;

let xDotSize = 0, targetXDotSize = 0;  // 当前值和目标值
let yDotSize = 0, targetYDotSize = 0;
let xDotUnusedSize = 0, targetXDotUnusedSize = 0;
let yDotUnusedSize = 0, targetYDotUnusedSize = 0;
let xInterval = 0, targetXInterval = 0;
let yInterval = 0, targetYInterval = 0;
let Spacing = 0, targetSpacing = 0;
let dotColor = 'rgb(0,0,0)', dotUnusedColor = 'rgb(0,0,0)', backgroundColor = 'rgb(255,255,255)';
let inputText;
let position;

let svgWriter;
let textAlignment = 'left'; // 可以是 'left', 'center', 或 'right'

import { dinkie_7px } from '../fonts/pixel_dinkie_7px.js';
import { intr } from '../fonts/pixel_intr_.js';
import { intr_soft_mono } from '../fonts/pixel_intr_soft_mono.js';
import { intr_soft } from '../fonts/pixel_intr_soft.js';
import { intr_text } from '../fonts/pixel_intr_text.js';
import { minecraft } from '../fonts/pixel_minecraft.js';
import { minimum } from '../fonts/pixel_minimum.js';

let letters = intr
let fontName = "intr"

let fontSelector = document.getElementById('fontSelect');
let fontDataTextarea = document.getElementById('fontData'); // 获取 textarea 元素

// 辅助函数：将字体对象格式化并填充到 textarea（自定义格式化 - 后处理方法）
function updateFontDataTextarea(fontObject) {
  try {
    // 1. 使用标准 JSON.stringify 生成带缩进的有效 JSON 字符串
    let initialString = JSON.stringify(fontObject, null, 2);

    // 2. 后处理：查找并压缩多行的内层数组为单行
    // 正则表达式匹配以缩进开头，包含多行数字的数组
    const regex = /^(\s*)\[\s*(\n(?:\s*\d+\s*,?\s*\n?)+)\s*\]/gm;
    let finalString = initialString.replace(regex, (match, indent, multilineContent) => {
      // 从多行内容中提取所有数字
      const numbers = multilineContent.match(/\d+/g);
      if (numbers) {
        // 用逗号连接数字（无空格）
        const joinedNumbers = numbers.join(',');
        // 返回带缩进的单行数组格式
        return `${indent}[${joinedNumbers}]`;
      }
      // 如果正则匹配出错或未找到数字，保持原样
      return match;
    });

    // 3. 更新 textarea
    fontDataTextarea.value = finalString;

  } catch (e) {
    console.error("Error formatting font data:", e);
    // 如果格式化失败，尝试回退到标准格式，以防万一
    try {
      fontDataTextarea.value = JSON.stringify(fontObject, null, 2);
    } catch (stringifyError) {
        console.error("Error stringifying font data as fallback:", stringifyError);
        fontDataTextarea.value = "// Error displaying font data";
    }
  }
}

fontSelector.addEventListener('change', function () {
  let preset = fontSelector.value;
  switch (preset) {
    case 'font1':
      letters = dinkie_7px;
      fontName = "dinkie_7px"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'intr':
      letters = intr;
      fontName = "intr"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'intr_soft_mono':
      letters = intr_soft_mono;
      fontName = "intr_soft_mono"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'intr_soft':
      letters = intr_soft;
      fontName = "intr_soft"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'intr_text':
      letters = intr_text;
      fontName = "intr_text"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'minecraft':
      letters = minecraft;
      fontName = "minecraft"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
    case 'minimum':
      letters = minimum;
      fontName = "minimum"
      updateFontDataTextarea(letters); // 更新 textarea
      break;
  }
})

function setup() {
  controller();
  let canvas = createCanvas(width, height);
  canvas.parent('rightBox');
  svgWriter = createGraphics(width, height, SVG);

  // 添加对齐方式选择器
  const alignmentSelect = createSelect();
  alignmentSelect.parent('controlPanel');
  alignmentSelect.option('left');
  alignmentSelect.option('center');
  alignmentSelect.option('right');
  alignmentSelect.selected('center');
  alignmentSelect.changed(() => {
    textAlignment = alignmentSelect.value();
    redraw();
  });
}

function updateTargetValue(id, targetVar) {
  targetVar = isNaN(parseFloat(document.getElementById(id).value)) 
    ? targetVar : parseFloat(document.getElementById(id).value);
}

function applyParameters() {
  // 获取用户输入的新目标值，并进行检查，确保输入值是有效的数字
  targetXInterval = isNaN(parseFloat(document.getElementById('xInterval').value)) 
    ? targetXInterval : parseFloat(document.getElementById('xInterval').value);
  targetYInterval = isNaN(parseFloat(document.getElementById('yInterval').value)) 
    ? targetYInterval : parseFloat(document.getElementById('yInterval').value);

  targetXDotSize = isNaN(parseFloat(document.getElementById('xDotSize').value)) 
    ? targetXDotSize : parseFloat(document.getElementById('xDotSize').value);
  
  targetYDotSize = isNaN(parseFloat(document.getElementById('yDotSize').value)) 
    ? targetYDotSize : parseFloat(document.getElementById('yDotSize').value);
  
  targetXDotUnusedSize = isNaN(parseFloat(document.getElementById('xDotUnusedSize').value)) 
    ? targetXDotUnusedSize : parseFloat(document.getElementById('xDotUnusedSize').value);
  
  targetYDotUnusedSize = isNaN(parseFloat(document.getElementById('yDotUnusedSize').value)) 
    ? targetYDotUnusedSize : parseFloat(document.getElementById('yDotUnusedSize').value);
  
  targetSpacing = isNaN(parseFloat(document.getElementById('Spacing').value)) 
    ? targetSpacing : parseFloat(document.getElementById('Spacing').value);
  
  dotColor = document.getElementById('dotColor').value;
  dotUnusedColor = document.getElementById('dotUnusedColor').value;
  backgroundColor = document.getElementById('backgroundColor').value;
  inputText = document.getElementById('inputText').value;
  textAlignment = document.getElementById('align').value;
  position = document.getElementById('position').value;

  // 使用 lerp 逐帧平滑过渡
  xInterval = lerp(xInterval, targetXInterval, 0.1);
  yInterval = lerp(yInterval, targetYInterval, 0.1);
  xDotSize = lerp(xDotSize, targetXDotSize, 0.1);
  yDotSize = lerp(yDotSize, targetYDotSize, 0.1);
  xDotUnusedSize = lerp(xDotUnusedSize, targetXDotUnusedSize, 0.1);
  yDotUnusedSize = lerp(yDotUnusedSize, targetYDotUnusedSize, 0.1);
  Spacing = lerp(Spacing, targetSpacing, 0.1);
}

function generateRandomPattern() {
  return Array.from({ length: letters['A'].length }, () =>
    Array.from({ length: letters['A'][0].length }, () => Math.random() < 0.5 ? 1 : 0)
  );
}

function drawText(renderer) {
  const paddingX = 30; // Define horizontal padding
  const paddingY = 30; // Define vertical padding

  const lines = inputText.split('\n');
  const lineHeights = lines.map(line => (letters[' '].length + Spacing) * yInterval * 2);
  const totalHeight = lineHeights.reduce((sum, height) => sum + height, 0);

  width = document.getElementById('rightBox').offsetWidth
  height = document.getElementById('rightBox').offsetHeight;

  if (totalHeight > fixHeight) {
    height = totalHeight + 60
  } else {
    height = fixHeight
  }

  const lineWidths = lines.map(line => {
    return line.split('').reduce((width, char) => {
      const letter = letters[char] || generateRandomPattern(); // 如果字体没有该字符，使用随机图案
      // 修正宽度计算以匹配 currentX 推进逻辑
      return width + (letter[0].length + Spacing) * 2 * xInterval;
    }, 0);
  });

  const maxWidth = Math.max(...lineWidths);
  
  if (maxWidth > fixWidth) {
    width = maxWidth + 60
  } else {
    width = fixWidth
  }

  // Calculate available drawing area considering padding
  const availableWidth = width - 2 * paddingX;
  const availableHeight = height - 2 * paddingY;

  let startX, startY;
  if (textAlignment === 'center') {
    // Center within the available width, then add left padding
    startX = paddingX + (availableWidth - maxWidth) / 2;
    // Center within the available height, then add top padding
    startY = paddingY + (availableHeight - totalHeight) / 2;
  } else if (textAlignment === 'right') {
    // Align right within the available width, then add left padding
    startX = paddingX + availableWidth - maxWidth;
    // Align top, add top padding
    startY = paddingY;
  } else { // 'left' alignment
    // Align left, add left padding
    startX = paddingX;
    // Align top, add top padding
    startY = paddingY;
  }

  // Ensure start coordinates are not negative if content exceeds available space
  startX = Math.max(paddingX, startX);
  startY = Math.max(paddingY, startY);

  let currentY = startY;
  lines.forEach((line, lineIndex) => {
    let currentX = textAlignment === 'center' ? (width - lineWidths[lineIndex]) / 2 :
      textAlignment === 'right' ? width - lineWidths[lineIndex] - paddingX : startX;

      for (const char of line) {
        // 如果字符在字体定义中没有找到，就使用 generateRandomPattern()，
        // 并且在计算宽度时使用 letters['A'] 的宽度作为替代
        const letter = letters[char] || generateRandomPattern();
      
        // 计算当前字符的宽度，使用已定义字体的宽度或 'A' 字符的宽度
        const letterWidth = letters[char] ? letter[0].length * 2 : letters['A'][0].length * 2;
      
        for (let i = 0; i < letter.length; i++) {
          for (let j = 0; j < letter[i].length; j++) {
      
            if (letter[i][j] === 2) {
              // 跳过这个点
              continue;
            }
      
            const dotX = (2 * j + 1) * xInterval + currentX;
            const dotY = (2 * i + 1) * yInterval + currentY;
            var realDotX, realDotY, realUnusedDotX, realUnusedDotY;

            switch(position) {
              case 'top-left':
                realDotX = dotX;
                realDotY = dotY;
                realUnusedDotX = dotX;
                realUnusedDotY = dotY;
                break;
              case 'top-center':
                realDotX = dotX - xDotSize / 2;
                realDotY = dotY;
                realUnusedDotX = dotX - xDotUnusedSize / 2;
                realUnusedDotY = dotY;
                break;
              case 'top-right':
                realDotX = dotX - xDotSize;
                realDotY = dotY;
                realUnusedDotX = dotX - xDotUnusedSize;
                realUnusedDotY = dotY;
                break;
              case 'middle-left':
                realDotX = dotX;
                realDotY = dotY - yDotSize / 2;
                realUnusedDotX = dotX;
                realUnusedDotY = dotY - yDotUnusedSize / 2;
                break;
              case 'center':
                realDotX = dotX - xDotSize / 2;
                realDotY = dotY - yDotSize / 2;
                realUnusedDotX = dotX - xDotUnusedSize / 2;
                realUnusedDotY = dotY - yDotUnusedSize / 2;
                break;
              case 'middle-right':
                realDotX = dotX - xDotSize;
                realDotY = dotY - yDotSize / 2;
                realUnusedDotX = dotX - xDotUnusedSize;
                realUnusedDotY = dotY - yDotUnusedSize / 2;
                break;
              case 'bottom-left':
                realDotX = dotX;
                realDotY = dotY - yDotSize;
                realUnusedDotX = dotX;
                realUnusedDotY = dotY - yDotUnusedSize;
                break;
              case 'bottom-center':
                realDotX = dotX - xDotSize / 2;
                realDotY = dotY - yDotSize;
                realUnusedDotX = dotX - xDotUnusedSize / 2;
                realUnusedDotY = dotY - yDotUnusedSize;
                break;
              case 'bottom-right':
                realDotX = dotX - xDotSize;
                realDotY = dotY - yDotSize;
                realUnusedDotX = dotX - xDotUnusedSize;
                realUnusedDotY = dotY - yDotUnusedSize;
                break;
              default:
                realDotX = dotX;
                realDotY = dotY;
                realUnusedDotX = dotX;
                realUnusedDotY = dotY;
            }

            const isActive = letter[i][j] === 1;
            renderer.fill(isActive ? dotColor : dotUnusedColor);
            renderer.rect(
              isActive ? realDotX : realUnusedDotX, // Removed + 30
              isActive ? realDotY : realUnusedDotY, // Removed + 30
              isActive ? xDotSize : xDotUnusedSize,
              isActive ? yDotSize : yDotUnusedSize,
              );
          }
        }
      
        // 根据当前字母的宽度调整X坐标，使用正确的宽度
        currentX += (letterWidth + Spacing * 2) * xInterval;
      }

    // 处理下一行的Y坐标
    currentY += lineHeights[lineIndex];
  });
}

function draw() {
  resizeCanvas(width, height)
  controller();
  applyParameters();
  clear();
  fill(backgroundColor);
  rect(0, 0, width, height);
  noStroke();
  drawText({ fill: fill, rect: rect });
}

function saveSvg() {
  applyParameters();
  svgWriter.resizeCanvas(width, height)
  svgWriter.clear();
  svgWriter.noStroke();
  svgWriter.fill(backgroundColor);
  svgWriter.rect(0, 0, width, height);
  drawText({ fill: svgWriter.fill, rect: svgWriter.rect });
  svgWriter.save("svgTest.svg");
}

// 事件监听器设置
window.addEventListener('load', () => {
  updateFontDataTextarea(letters); // 初始填充 fontData textarea

  const paramInputs = ['xInterval', 'yInterval', 'xDotSize', 'yDotSize',
    'xDotUnusedSize', 'yDotUnusedSize', 'dotColor',
    'dotUnusedColor', 'backgroundColor', 'inputText', 'Spacing'];
  paramInputs.forEach(param => {
    document.getElementById(param).addEventListener('input', () => {
      applyParameters();
      redraw();
    });
  });

  document.getElementById('saveSvg').addEventListener('click', saveSvg);

  // 添加 fontData textarea 的事件监听器
  fontDataTextarea.addEventListener('input', () => {
    try {
      const newFontData = JSON.parse(fontDataTextarea.value);
      // 可以在这里添加更严格的验证，确保 newFontData 结构符合预期
      letters = newFontData;
      redraw(); // 重绘画布以反映更改
    } catch (e) {
      console.error("Error parsing font data from textarea:", e);
      // 可以选择性地给用户反馈，例如边框变红
    }
  });
});

window.setup = setup;
window.draw = draw;