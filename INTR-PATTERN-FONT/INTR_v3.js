
import controller from './controller.js'
import { matrixToSvg, svgToD, DToO } from './saveFont.js'

let fixWidth = document.getElementById('rightBox').offsetWidth
let fixHeight = document.getElementById('rightBox').offsetHeight;

let width = document.getElementById('rightBox').offsetWidth
let height = document.getElementById('rightBox').offsetHeight;

let xInterval = 0, targetXInterval = 0;
let yInterval = 0, targetYInterval = 0;
let Spacing = 0, targetSpacing = 0;
let inputText;
let aSVG, bSVG, cSVG, dSVG, eSVG, fSVG, aSVGSVG, bSVGSVG, cSVGSVG, dSVGSVG, eSVGSVG, fSVGSVG
let aWidth, aHeight, bWidth, bHeight, cWidth, cHeight, dWidth, dHeight, eWidth, eHeight, fWidth, fHeight
let svgWriter;
let textAlignment = 'left'; // 可以是 'left', 'center', 或 'right'
let backgroundColor
let textareas

export function loadUserSVG(svgText, errorMessage, svg) {
  // 使用DOMParser验证SVG
  let parser = new DOMParser();
  let doc = parser.parseFromString(svgText, "image/svg+xml");

  let viewBoxWidth, viewBoxHeight

  const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
  if (viewBoxMatch && viewBoxMatch[1]) {
    const viewBoxValues = viewBoxMatch[1].split(' ').map(Number);
    viewBoxWidth = viewBoxValues[2]; // viewBox的宽度
    viewBoxHeight = viewBoxValues[3]; // viewBox的高度
  }

  // 检查SVG是否有效
  if (doc.documentElement.nodeName !== "svg") {
    errorMessage.html("无效的SVG格式，请检查你的输入！");
    return;
  }
  // 使用 TextEncoder 将 SVG 文本转换为 UTF-8 编码字节数组
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(svgText);

  // 使用 btoa 将字节数组转换为 Base64 编码
  let encoded = btoa(String.fromCharCode.apply(null, uint8Array));
  // 如果有效，创建数据URL并加载图像
  let svgDataUrl = 'data:image/svg+xml;base64,' + encoded;
  console.log(svgDataUrl)
  switch (svg) {
    case 'svgA':
      aSVG = loadImage(svgDataUrl);
      aSVGSVG = loadSVG(svgDataUrl);
      aWidth = viewBoxWidth;
      aHeight = viewBoxHeight;
      break;
    case 'svgB':
      bSVG = loadImage(svgDataUrl);
      bSVGSVG = loadSVG(svgDataUrl);
      bWidth = viewBoxWidth;
      bHeight = viewBoxHeight;
      break;
    case 'svgC':
      cSVG = loadImage(svgDataUrl);
      cSVGSVG = loadSVG(svgDataUrl);
      cWidth = viewBoxWidth;
      cHeight = viewBoxHeight;
      break;
    case 'svgD':
      dSVG = loadImage(svgDataUrl);
      dSVGSVG = loadSVG(svgDataUrl);
      dWidth = viewBoxWidth;
      dHeight = viewBoxHeight;
      break;
    case 'svgE':
      eSVG = loadImage(svgDataUrl);
      eSVGSVG = loadSVG(svgDataUrl);
      eWidth = viewBoxWidth;
      eHeight = viewBoxHeight;
      break;
    case 'svgF':
      fSVG = loadImage(svgDataUrl);
      fSVGSVG = loadSVG(svgDataUrl);
      fWidth = viewBoxWidth;
      fHeight = viewBoxHeight;
      break;
  }
}

import { circle_n_line } from '../fonts/pattern_circle_n_line.js'
import { corner } from '../fonts/pattern_corner.js';
import { lines } from '../fonts/pattern_lines.js';

let letters = corner
let fontName = 'corner'

let fontDataTextarea = document.getElementById('fontData'); // 获取 textarea 元素
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

let applyPreset = document.getElementById('presetSelect');
applyPreset.addEventListener('change', function () {
  let preset = applyPreset.value;
  switch (preset) {
    case 'corner':
      letters = corner
      fontName = 'corner'
      console.log(letters)
      updateFontDataTextarea(letters)
      break; // 添加 break 语句
    case 'circle_n_line':
      letters = circle_n_line
      fontName = 'circle_n_line'
      console.log(letters)
      updateFontDataTextarea(letters)
      break
    case 'lines':
      letters = lines
      fontName = 'lines'
      console.log(letters)
      updateFontDataTextarea(letters)
      break
  }
})

function preload() {

  textareas = selectAll('.svgText');

  // 为每个textarea添加事件监听器
  textareas.forEach(textarea => {
    let errorMessage = createDiv('');
    errorMessage.position(textarea.x, textarea.y + 120); // 在textarea下方显示错误信息

    // 监听textarea内容变化，触发loadUserSVG
    loadUserSVG(textarea.value(), errorMessage, textarea.elt.id);
  });

}

paper.setup();

function setup() {

  textareas = selectAll('.svgText');

  // 为每个textarea添加事件监听器
  textareas.forEach(textarea => {
    let errorMessage = createDiv('');
    errorMessage.position(textarea.x, textarea.y + 120); // 在textarea下方显示错误信息

    // 监听textarea内容变化，触发loadUserSVG
    textarea.input(() => loadUserSVG(textarea.value(), errorMessage, textarea.elt.id));
  });

  imageMode(CENTER)
  angleMode(DEGREES)
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

function applyParameters() {
  // 获取用户输入的新目标值，并进行检查，确保输入值是有效的数字

  targetXInterval = isNaN(parseFloat(document.getElementById('xInterval').value))
    ? targetXInterval : parseFloat(document.getElementById('xInterval').value);

  targetYInterval = isNaN(parseFloat(document.getElementById('yInterval').value))
    ? targetYInterval : parseFloat(document.getElementById('yInterval').value);

  targetSpacing = isNaN(parseFloat(document.getElementById('Spacing').value))
    ? targetSpacing : parseFloat(document.getElementById('Spacing').value);

  backgroundColor = document.getElementById('backgroundColor').value;
  inputText = document.getElementById('inputText').value;

  // 使用 lerp 逐帧平滑过渡
  xInterval = lerp(xInterval, targetXInterval, 0.1);
  yInterval = lerp(yInterval, targetYInterval, 0.1);

  Spacing = lerp(Spacing, targetSpacing, 0.1);
}

function generateRandomPattern() {
  return Array.from({ length: letters[' '].length }, () =>
    Array.from({ length: letters[' '][0].length }, () => Math.random() < 0.5 ? 1 : 0)
  );
}

function drawText(renderer, mode) {
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
      textAlignment === 'right' ? width - lineWidths[lineIndex] : startX;

    for (const char of line) {
      // 如果字符在字体定义中没有找到，就使用 generateRandomPattern()，
      const letter = letters[char] || generateRandomPattern();

      const letterWidth = letters[char] ? letter[0].length * 2 : letters[' '][0].length * 2;

      for (let i = 0; i < letter.length; i++) {
        for (let j = 0; j < letter[i].length; j++) {

          const dotX = (2 * j + 1) * xInterval + currentX + 30;
          const dotY = (2 * i + 1) * yInterval + currentY + 30;

          if (mode === 'bitmap') {
            switch (letter[i][j]) {
              case 0:
                break;
              case 1:
                renderer.image(aSVG, dotX, dotY, aWidth, aHeight)
                break;
              case 2:
                renderer.image(bSVG, dotX, dotY, bWidth, bHeight)
                break;
              case 3:
                renderer.image(cSVG, dotX, dotY, cWidth, cHeight)
                break;
              case 4:
                renderer.image(dSVG, dotX, dotY, dWidth, dHeight)
                break;
              case 5:
                renderer.image(eSVG, dotX, dotY, eWidth, eHeight)
                break;
              case 6:
                renderer.image(fSVG, dotX, dotY, fWidth, fHeight)
                break;
            }
          } else {
            switch (letter[i][j]) {
              case 0:
                break;
              case 1:
                renderer.image(aSVGSVG, dotX, dotY, aWidth, aHeight)
                break;
              case 2:
                renderer.image(bSVGSVG, dotX, dotY, bWidth, bHeight)
                break;
              case 3:
                renderer.image(cSVGSVG, dotX, dotY, cWidth, cHeight)
                break;
              case 4:
                renderer.image(dSVGSVG, dotX, dotY, dWidth, dHeight)
                break;
              case 5:
                renderer.image(eSVGSVG, dotX, dotY, eWidth, eHeight)
                break;
              case 6:
                renderer.image(fSVGSVG, dotX, dotY, fWidth, fHeight)
                break;
            }
          }
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
  drawText({ image: image }, 'bitmap');
}

function generate32BitIdentifier(input1, input2, input3, input4, input5, input6) {
  const combinedString = [input1, input2, input3, input4, input5, input6]
    .map(input => {
      try {
        if (input === undefined) return "undefined";
        if (input === null) return "null";
        return JSON.stringify(input) || String(input);
      } catch (e) {
        return String(input);
      }
    })
    .join('|');

  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    // 经典的 djb2 哈希算法步骤: hash = hash * 33 + charCode
    // 这里使用位运算版本: hash = (hash << 5) + hash + charCode;
    // 或者另一种常见变体: hash = (hash << 5) - hash + charCode;
    hash = (hash << 5) - hash + char;
    hash |= 0; // 通过位或 0 操作，强制转换为 32 位有符号整数
  }

  const hexIdentifier = (hash >>> 0).toString(16).padStart(8, '0');
  return hexIdentifier;
}

function saveFont(familyName, styleName) {

  const finalFamilyName = familyName || `INTR-PIXEL-${fontName}-Default`;
  const finalStyleName = styleName || generate32BitIdentifier(
    document.getElementById('svgA').value,
    document.getElementById('svgB').value,
    document.getElementById('svgC').value,
    document.getElementById('svgD').value,
    document.getElementById('svgE').value,
    document.getElementById('svgF').value
  );

  applyParameters();

  var glyphs = []

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    advanceWidth: 0,
    path: new opentype.Path()
  });
  glyphs.push(notdefGlyph)


  for (let char in letters) {
    console.log(char.charCodeAt(0))
    console.log(char)
    if (char === ' ') {
      const Glyph = new opentype.Glyph({
        name: char,
        unicode: char.charCodeAt(0),
        advanceWidth: xInterval * letters[char][0].length * 20,
      });
      glyphs.push(Glyph)
    } else {
      var svg = matrixToSvg(letters[char],
        document.getElementById('svgA').value,
        document.getElementById('svgB').value,
        document.getElementById('svgC').value,
        document.getElementById('svgD').value,
        document.getElementById('svgE').value,
        document.getElementById('svgF').value,
        xInterval * 20, yInterval * 20, 10)

      var dPath = svgToD(svg, yInterval, letters[char])
      var otPath = new opentype.Path();
      DToO(otPath, dPath, 0, 0, 1)
      const Glyph = new opentype.Glyph({
        name: char,
        unicode: char.charCodeAt(0),
        advanceWidth: xInterval * (letters[char][0].length + 1) * 20,
        path: otPath
      });
      glyphs.push(Glyph)
    }
  }
  const font = new opentype.Font({
    familyName: finalFamilyName,
    fullName: finalFamilyName,
    styleName: finalStyleName,
    unitsPerEm: 1000,
    ascender: yInterval * (letters[' '].length + 1) * 20,
    descender: -200,
    glyphs: glyphs
  });

  const binary = font.toArrayBuffer();
  const blob = new Blob([binary], { type: 'font/opentype' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFamilyName = finalFamilyName.replace(/[^a-z0-9_-]/gi, '_');
  const safeStyleName = finalStyleName.replace(/[^a-z0-9_-]/gi, '_'); // Replace invalid chars
  link.download = `${safeFamilyName}_${safeStyleName}.otf`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

// --- Modal Elements ---
const saveFontModal = document.getElementById('saveFontModal');
const fontFamilyNameInput = document.getElementById('fontFamilyName');
const fontStyleNameInput = document.getElementById('fontStyleName');
const modalConfirmButton = document.getElementById('modal-confirm');
const modalCancelButton = document.getElementById('modal-cancel');

// --- Function to open the modal ---
function openSaveModal() {
  // Optionally reset the input field value or set a default
  fontFamilyNameInput.value = `INTR-PIXEL-${fontName}`;
  fontStyleNameInput.value = generate32BitIdentifier(
    document.getElementById('svgA').value,
    document.getElementById('svgB').value,
    document.getElementById('svgC').value,
    document.getElementById('svgD').value,
    document.getElementById('svgE').value,
    document.getElementById('svgF').value
  );
  saveFontModal.style.display = 'block';
}

// --- Function to close the modal ---
function closeSaveModal() {
  saveFontModal.style.display = 'none';
}

// 事件监听器设置
window.addEventListener('load', () => {

    // --- MODIFIED: Save Font Button Listener ---
  // document.getElementById('saveFont').addEventListener('click', saveFont); // Original line
  document.getElementById('saveFont').addEventListener('click', openSaveModal); // New: Opens the modal

  // --- ADDED: Modal Button Listeners ---
  modalCancelButton.addEventListener('click', closeSaveModal);

  modalConfirmButton.addEventListener('click', () => {
    const familyName = fontFamilyNameInput.value.trim();
    const styleName = fontStyleNameInput.value.trim();
    if (familyName && styleName) {
      try {
        // Call the modified saveFont function with the name
        const success = saveFont(familyName, styleName); // Pass the name
        if (success) {
           console.log(`Font saved with family name: ${familyName}`);
           console.log(`Font saved with style name: ${styleName}`);
        }
      } catch (error) {
        console.error("Error saving font:", error);
        alert("Error saving font. Check console for details."); // Optional user feedback
      } finally {
         closeSaveModal(); // Close modal regardless of success or error
      }
    } else {
      alert("Please enter valid name."); // Basic validation
    }
  });

  updateFontDataTextarea(letters);
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
window.preload = preload;