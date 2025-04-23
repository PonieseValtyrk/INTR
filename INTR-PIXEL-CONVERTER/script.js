// --- 严格模式 ---
// 启用JavaScript严格模式，提供更好的错误检查和安全性
"use strict";

// --- DOM元素 ---
// 获取页面上的DOM元素引用
const fontFileInput = document.getElementById('font-file');
const fileNameSpan = document.getElementById('file-name');
const charInput = document.getElementById('char-input');
const fontInfoDiv = document.getElementById('font-info');

const gridRowsSlider = document.getElementById('grid-rows');
const rowsValueSpan = document.getElementById('rows-value');
const gridColsSlider = document.getElementById('grid-cols');
const colsValueSpan = document.getElementById('cols-value');
const thresholdSlider = document.getElementById('threshold');
const thresholdValueSpan = document.getElementById('threshold-value');

const gridOffsetXSlider = document.getElementById('grid-offset-x');
const offsetXValueSpan = document.getElementById('offset-x-value');
const trimColumnsCheckbox = document.getElementById('trim-columns-checkbox');
let shouldTrimColumns = true; // 默认启用去除空列
const gridOffsetYSlider = document.getElementById('grid-offset-y');
const offsetYValueSpan = document.getElementById('offset-y-value');
const gridRenderWidthSlider = document.getElementById('grid-render-width');
const renderWidthValueSpan = document.getElementById('render-width-value');
const gridRenderHeightSlider = document.getElementById('grid-render-height');
const renderHeightValueSpan = document.getElementById('render-height-value');
const fontRenderSizeInput = document.getElementById('font-render-size');
const resetGridBtn = document.getElementById('reset-grid-btn');

const interactiveCanvas = document.getElementById('interactive-canvas');
const canvasStatusDiv = document.getElementById('canvas-status');
const iCtx = interactiveCanvas.getContext('2d'); // Interactive Context

const singleCharMatrixPreviewPre = document.getElementById('single-char-matrix-preview');
const charsToProcessTextarea = document.getElementById('chars-to-process');
const generateAllBtn = document.getElementById('generate-all-btn');
const batchStatusDiv = document.getElementById('batch-status');
const outputMatrixPre = document.getElementById('output-matrix'); // Main output PRE
const copyMatrixBtn = document.getElementById('copy-matrix-btn');
const copyStatusDiv = document.getElementById('copy-status');

// Offscreen canvas - create dynamically
const charRenderCanvas = document.createElement('canvas');
const charCtx = charRenderCanvas.getContext('2d', { willReadFrequently: true });

// --- 全局状态 ---
// 存储应用程序的全局状态和变量
let loadedFont = null;
let currentChar = charInput.value || 'A';
let charImageData = null; // Stores image data for the *interactive* character
let lastRenderedFontSize = 0;
let displayScale = 1;
let redrawTimeout;

const spaceWidthInput = document.getElementById('space-width');
let gridParams = {
    rows: parseInt(gridRowsSlider.value, 10),
    cols: parseInt(gridColsSlider.value, 10),
    threshold: parseInt(thresholdSlider.value, 10) / 100,
    offsetX: parseInt(gridOffsetXSlider.value, 10),
    offsetY: parseInt(gridOffsetYSlider.value, 10),
    renderWidth: parseInt(gridRenderWidthSlider.value, 10),
    renderHeight: parseInt(gridRenderHeightSlider.value, 10),
    fontRenderSize: parseInt(fontRenderSizeInput.value, 10),
    spaceWidth: parseInt(spaceWidthInput.value, 10)
};

spaceWidthInput.addEventListener('input', () => {
    const newWidth = parseInt(spaceWidthInput.value, 10);
    if (newWidth > 0 && newWidth !== gridParams.spaceWidth) {
        gridParams.spaceWidth = newWidth;
        requestRedraw('空格宽度改变');
    }
});

let scale = undefined;
let baseline = undefined; // Ensure ascender is non-negative
let descent = undefined; // Ensure descender is non-negative for height calc
let glyphHeight = undefined; // Max height from baseline to top + baseline to bottom
let glyphAdvanceWidth = undefined; // Use advanceWidth for layout

// Dragging state
let draggingState = null;
const handleSize = 12; // Size for visual handles and edge detection margin
const minGridDimension = 10; // Minimum pixels for grid width/height during resize

// --- 事件监听器 ---
// 为DOM元素添加各种事件处理函数
fontFileInput.addEventListener('change', handleFontFileSelect);
charInput.addEventListener('input', handleCharChange);

gridRowsSlider.addEventListener('input', () => updateGridParams('rows', gridRowsSlider.value, rowsValueSpan));
gridColsSlider.addEventListener('input', () => updateGridParams('cols', gridColsSlider.value, colsValueSpan));
thresholdSlider.addEventListener('input', () => updateGridParams('threshold', thresholdSlider.value, thresholdValueSpan, '%'));
gridOffsetXSlider.addEventListener('input', () => updateGridParams('offsetX', gridOffsetXSlider.value, offsetXValueSpan, 'px'));
gridOffsetYSlider.addEventListener('input', () => updateGridParams('offsetY', gridOffsetYSlider.value, offsetYValueSpan, 'px'));
gridRenderWidthSlider.addEventListener('input', () => updateGridParams('renderWidth', gridRenderWidthSlider.value, renderWidthValueSpan, 'px'));
gridRenderHeightSlider.addEventListener('input', () => updateGridParams('renderHeight', gridRenderHeightSlider.value, renderHeightValueSpan, 'px'));
fontRenderSizeInput.addEventListener('input', () => {
    const newSize = parseInt(fontRenderSizeInput.value, 10);
    if (newSize > 0 && newSize !== gridParams.fontRenderSize) {
        gridParams.fontRenderSize = newSize;
        charImageData = null;  // Force interactive char re-render
        requestRedraw('字体大小改变');
    }
});

resetGridBtn.addEventListener('click', resetGridPosition);
copyMatrixBtn.addEventListener('click', copyMatrix);
generateAllBtn.addEventListener('click', handleGenerateAllClick);

interactiveCanvas.addEventListener('mousedown', handleMouseDown);
interactiveCanvas.addEventListener('mousemove', handleMouseMove);
interactiveCanvas.addEventListener('mouseup', handleMouseUp);
interactiveCanvas.addEventListener('mouseleave', handleMouseLeave);

window.addEventListener('resize', () => {
    setupCanvasScaling();
    requestRedraw('窗口大小调整');
});

// --- 初始化 ---
// 应用程序启动时的初始化操作
updateAllSliderDisplays();
setupCanvasScaling();
checkOpentypeLoaded();

// --- 功能函数 ---
// 应用程序的主要功能实现

/**
 * 检查opentype.js库是否加载成功
 * 如果加载失败，禁用相关功能并显示错误信息
 */
function checkOpentypeLoaded() {
    setTimeout(() => {
        if (typeof opentype === 'undefined') {
            setCanvasStatus('错误：opentype.js 库加载失败！', 'error');
            fontFileInput.disabled = true;
            charInput.disabled = true;
            generateAllBtn.disabled = true;
        }
    }, 100);
}

/**
 * 设置画布的缩放比例
 * 根据设备像素比调整画布物理尺寸和逻辑尺寸
 */
function setupCanvasScaling() {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = 500;
    const logicalHeight = 400;

    interactiveCanvas.width = logicalWidth * dpr;
    interactiveCanvas.height = logicalHeight * dpr;
    iCtx.scale(dpr, dpr);
    displayScale = dpr;

    interactiveCanvas.style.width = `${logicalWidth}px`;
    interactiveCanvas.style.height = `${logicalHeight}px`;
    console.log(`Canvas setup: DPR=${dpr}, Logical=${logicalWidth}x${logicalHeight}, Physical=${interactiveCanvas.width}x${interactiveCanvas.height}`);
}

/**
 * 处理字体文件选择事件
 * @param {Event} event - 文件选择事件对象
 * 读取用户选择的字体文件并解析
 */
function handleFontFileSelect(event) {
    const file = event.target.files[0];
    generateAllBtn.disabled = true;
    if (!file) {
        loadedFont = null;
        fileNameSpan.textContent = '未选择';
        fontInfoDiv.textContent = '';
        setCanvasStatus('请选择字体文件');
        clearInteractiveCanvas();
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            loadedFont = opentype.parse(e.target.result);
            fileNameSpan.textContent = file.name;
            let fontName = 'N/A';
            if (loadedFont.names.fontFamily && loadedFont.names.fontFamily.en) {
                fontName = loadedFont.names.fontFamily.en;
            } else if (Object.values(loadedFont.names.fontFamily || {}).length > 0) {
                fontName = Object.values(loadedFont.names.fontFamily)[0];
            }
            fontInfoDiv.textContent = `字体: ${fontName}, Units/Em: ${loadedFont.unitsPerEm}`;
            charImageData = null;
            setCanvasStatus('字体已加载。', 'success');
            generateAllBtn.disabled = false;
            requestRedraw('字体加载');
            // 计算网格宽度
            const testChars = ['W', 'M'];
            let maxWidth = 0;

            testChars.forEach(char => {
                const glyph = loadedFont.charToGlyph(char);
                if (glyph.advanceWidth > maxWidth) {
                    maxWidth = glyph.advanceWidth;
                }
            });

            gridParams.renderWidth = (maxWidth / loadedFont.unitsPerEm) * gridParams.fontRenderSize;
            let glyphHeight = Math.abs(loadedFont.ascender) + Math.abs(loadedFont.descender) * gridParams.fontRenderSize / loadedFont.unitsPerEm;
            console.log(glyphHeight);
            gridParams.renderHeight = glyphHeight;
            gridRenderWidthSlider.value = gridParams.renderWidth;
            renderWidthValueSpan.innerText = `${gridParams.renderWidth}px`;
            gridRenderHeightSlider.value = gridParams.renderHeight;
            renderHeightValueSpan.innerText = `${gridParams.renderHeight}px`;
        } catch (err) {
            console.error("Font parsing error:", err);
            loadedFont = null;
            fileNameSpan.textContent = '加载失败';
            fontInfoDiv.textContent = '';
            setCanvasStatus(`字体解析失败: ${err.message}`, 'error');
            clearInteractiveCanvas();
        }
    };
    reader.onerror = () => {
        console.error("File reading error");
        loadedFont = null;
        fileNameSpan.textContent = '读取失败';
        fontInfoDiv.textContent = '';
        setCanvasStatus('文件读取错误。', 'error');
        clearInteractiveCanvas();
    };
    setCanvasStatus('正在加载字体...');
    reader.readAsArrayBuffer(file);
}

/**
 * 处理字符输入变化事件
 * @param {Event} event - 输入事件对象
 * 更新当前字符并触发重新渲染
 */
function handleCharChange(event) {
    let newChar = event.target.value;
    if (newChar.length > 1) {
        newChar = newChar.slice(0, 1);
        event.target.value = newChar;
    }
    if (newChar !== currentChar && (newChar || currentChar)) {
        currentChar = newChar;
        if (currentChar) {
            charImageData = null;
            requestRedraw('字符改变');
        } else {
            clearInteractiveCanvas();
            setCanvasStatus('请输入交互预览字符。', 'warn');
            singleCharMatrixPreviewPre.textContent = '[ ]';
            charImageData = null;
        }
    }
}

/**
 * 更新网格参数
 * @param {string} param - 参数名称
 * @param {string} value - 参数值
 * @param {HTMLElement} spanElement - 显示参数值的DOM元素
 * @param {string} [unit=''] - 参数单位
 * 更新网格参数并触发UI更新
 */
function updateGridParams(param, value, spanElement, unit = '') {
    const parsedValue = (param === 'threshold') ? parseFloat(value) / 100 : parseInt(value, 10);
    if (isNaN(parsedValue) || gridParams[param] === parsedValue) return;

    gridParams[param] = parsedValue;

    if (spanElement) {
        spanElement.textContent = `${value}${unit}`;
    }

    if (['rows', 'cols', 'threshold', 'offsetX', 'offsetY', 'renderWidth', 'renderHeight'].includes(param)) {
        requestRedraw(`参数调整: ${param}`);
    }
}

/**
 * 同步滑块控件到网格参数
 * 确保UI控件值与当前网格参数一致
 */
function syncSlidersToGridParams() {
    if (+gridRowsSlider.value !== gridParams.rows) gridRowsSlider.value = gridParams.rows;
    rowsValueSpan.textContent = gridParams.rows;

    if (+gridColsSlider.value !== gridParams.cols) gridColsSlider.value = gridParams.cols;
    colsValueSpan.textContent = gridParams.cols;

    const thresholdVal = Math.round(gridParams.threshold * 100);
    if (+thresholdSlider.value !== thresholdVal) thresholdSlider.value = thresholdVal;
    thresholdValueSpan.textContent = `${thresholdVal}%`;

    if (+gridOffsetXSlider.value !== gridParams.offsetX) gridOffsetXSlider.value = gridParams.offsetX;
    offsetXValueSpan.textContent = `${gridParams.offsetX}px`;

    if (+gridOffsetYSlider.value !== gridParams.offsetY) gridOffsetYSlider.value = gridParams.offsetY;
    offsetYValueSpan.textContent = `${gridParams.offsetY}px`;

    if (+gridRenderWidthSlider.value !== gridParams.renderWidth) gridRenderWidthSlider.value = gridParams.renderWidth;
    renderWidthValueSpan.textContent = `${gridParams.renderWidth}px`;

    if (+gridRenderHeightSlider.value !== gridParams.renderHeight) gridRenderHeightSlider.value = gridParams.renderHeight;
    renderHeightValueSpan.textContent = `${gridParams.renderHeight}px`;

    if (+fontRenderSizeInput.value !== gridParams.fontRenderSize) fontRenderSizeInput.value = gridParams.fontRenderSize;
}

/**
 * 更新所有滑块显示值
 * 初始化时设置滑块值的文本显示
 */
function updateAllSliderDisplays() {
    rowsValueSpan.textContent = gridRowsSlider.value;
    colsValueSpan.textContent = gridColsSlider.value;
    thresholdValueSpan.textContent = thresholdSlider.value + '%';
    offsetXValueSpan.textContent = gridOffsetXSlider.value + 'px';
    offsetYValueSpan.textContent = gridOffsetYSlider.value + 'px';
    renderWidthValueSpan.textContent = gridRenderWidthSlider.value + 'px';
    renderHeightValueSpan.textContent = gridRenderHeightSlider.value + 'px';
}

/**
 * 重置网格位置和大小
 * 将网格参数恢复为默认值
 */
function resetGridPosition() {
    gridParams.offsetX = 0;
    gridParams.offsetY = 0;
    syncSlidersToGridParams();
    requestRedraw('网格重置');
}

// --- 坐标转换 ---
// 处理鼠标坐标与画布坐标之间的转换
/**
 * 获取鼠标在画布上的坐标位置
 * @param {HTMLCanvasElement} canvas - 目标画布元素
 * @param {MouseEvent} event - 鼠标事件对象
 * @returns {Object} 包含x,y坐标的对象
 */
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// --- 交互模式检测(使用逻辑坐标) ---
// 根据鼠标位置确定当前的交互模式(移动/缩放)
function getInteractionMode(mouseX, mouseY) {
    if (!loadedFont || !currentChar) return null;

    const hs = handleSize;
    const hs2 = hs / 2;
    const logicalWidth = interactiveCanvas.width / displayScale;
    const logicalHeight = interactiveCanvas.height / displayScale;
    const canvasCenterX = logicalWidth / 2;
    const canvasCenterY = logicalHeight / 2;

    const gridLeft = canvasCenterX + gridParams.offsetX - gridParams.renderWidth / 2;
    const gridRight = gridLeft + gridParams.renderWidth;
    const gridTop = canvasCenterY + gridParams.offsetY - gridParams.renderHeight / 2;
    const gridBottom = gridTop + gridParams.renderHeight;

    // Check corners
    const onTopLeft = mouseX >= gridLeft - hs2 && mouseX <= gridLeft + hs2 && mouseY >= gridTop - hs2 && mouseY <= gridTop + hs2;
    const onTopRight = mouseX >= gridRight - hs2 && mouseX <= gridRight + hs2 && mouseY >= gridTop - hs2 && mouseY <= gridTop + hs2;
    const onBottomLeft = mouseX >= gridLeft - hs2 && mouseX <= gridLeft + hs2 && mouseY >= gridBottom - hs2 && mouseY <= gridBottom + hs2;
    const onBottomRight = mouseX >= gridRight - hs2 && mouseX <= gridRight + hs2 && mouseY >= gridBottom - hs2 && mouseY <= gridBottom + hs2;

    if (onTopLeft) return 'scale-tl';
    if (onTopRight) return 'scale-tr';
    if (onBottomLeft) return 'scale-bl';
    if (onBottomRight) return 'scale-br';

    // Check edges
    const onLeftEdge = mouseX >= gridLeft - hs && mouseX <= gridLeft + hs && mouseY > gridTop + hs2 && mouseY < gridBottom - hs2; // Adjusted edge check slightly
    const onRightEdge = mouseX >= gridRight - hs && mouseX <= gridRight + hs && mouseY > gridTop + hs2 && mouseY < gridBottom - hs2;
    const onTopEdge = mouseY >= gridTop - hs && mouseY <= gridTop + hs && mouseX > gridLeft + hs2 && mouseX < gridRight - hs2;
    const onBottomEdge = mouseY >= gridBottom - hs && mouseY <= gridBottom + hs && mouseX > gridLeft + hs2 && mouseX < gridRight - hs2;

    if (onLeftEdge) return 'scale-l';
    if (onRightEdge) return 'scale-r';
    if (onTopEdge) return 'scale-t';
    if (onBottomEdge) return 'scale-b';

    // Check move (inside, not on edge/corner)
    if (mouseX > gridLeft + hs && mouseX < gridRight - hs && mouseY > gridTop + hs && mouseY < gridBottom - hs) return 'move';

    return null;
}

// --- 鼠标事件处理 ---
// 处理各种鼠标交互事件
/**
 * 处理鼠标按下事件
 * @param {MouseEvent} event - 鼠标事件对象Width
function handleMouseDown(event) {
    if (event.button !== 0) return;
    const mousePos = getMousePos(interactiveCanvas, event);
    const mode = getInteractionMode(mousePos.x, mousePos.y);

    if (mode) {
        draggingState = {
            mode: mode,
            startX: mousePos.x,
            startY: mousePos.y,
            initialGrid: { ...gridParams }
        };
        interactiveCanvas.className = `canvas-${mode.startsWith('scale') ? getResizeCursor(mode) : 'grabbing'}`;
        interactiveCanvas.style.cursor = getComputedStyle(interactiveCanvas).cursor;
        event.preventDefault();
    } else {
        draggingState = null;
    }
}

/**
 * 处理鼠标移动事件
 * @param {MouseEvent} event - 鼠标事件对象
 * 根据当前交互模式更新网格参数
 */
function handleMouseMove(event) {
    const mousePos = getMousePos(interactiveCanvas, event);

    if (draggingState) {
        const deltaX = mousePos.x - draggingState.startX;
        const deltaY = mousePos.y - draggingState.startY;
        const initial = draggingState.initialGrid;

        const logicalWidth = interactiveCanvas.width / displayScale;
        const logicalHeight = interactiveCanvas.height / displayScale;
        const canvasCenterX = logicalWidth / 2;
        const canvasCenterY = logicalHeight / 2;
        const initialGridLeft = canvasCenterX + initial.offsetX - initial.renderWidth / 2;
        const initialGridRight = initialGridLeft + initial.renderWidth;
        const initialGridTop = canvasCenterY + initial.offsetY - initial.renderHeight / 2;
        const initialGridBottom = initialGridTop + initial.renderHeight;

        let newOffsetX = initial.offsetX;
        let newOffsetY = initial.offsetY;
        let newWidth = initial.renderWidth;
        let newHeight = initial.renderHeight;

        switch (draggingState.mode) {
            case 'move':
                newOffsetX = initial.offsetX + deltaX;
                newOffsetY = initial.offsetY + deltaY;
                break;
            case 'scale-l': {
                const newLeft = initialGridLeft + deltaX;
                newWidth = Math.max(minGridDimension, initialGridRight - newLeft);
                const constrainedLeft = initialGridRight - newWidth;
                newOffsetX = (constrainedLeft + initialGridRight) / 2 - canvasCenterX;
                break;
            }
            case 'scale-r': {
                const newRight = initialGridRight + deltaX;
                newWidth = Math.max(minGridDimension, newRight - initialGridLeft);
                newOffsetX = (initialGridLeft + (initialGridLeft + newWidth)) / 2 - canvasCenterX;
                break;
            }
            case 'scale-t': {
                const newTop = initialGridTop + deltaY;
                newHeight = Math.max(minGridDimension, initialGridBottom - newTop);
                const constrainedTop = initialGridBottom - newHeight;
                newOffsetY = (constrainedTop + initialGridBottom) / 2 - canvasCenterY;
                break;
            }
            case 'scale-b': {
                const newBottom = initialGridBottom + deltaY;
                newHeight = Math.max(minGridDimension, newBottom - initialGridTop);
                newOffsetY = (initialGridTop + (initialGridTop + newHeight)) / 2 - canvasCenterY;
                break;
            }
            case 'scale-tl':
                newWidth = Math.max(minGridDimension, initial.renderWidth - deltaX);
                newHeight = Math.max(minGridDimension, initial.renderHeight - deltaY);
                newOffsetX = initial.offsetX + deltaX / 2; // Keep corner under mouse roughly
                newOffsetY = initial.offsetY + deltaY / 2;
                break;
            case 'scale-tr':
                newWidth = Math.max(minGridDimension, initial.renderWidth + deltaX);
                newHeight = Math.max(minGridDimension, initial.renderHeight - deltaY);
                newOffsetX = initial.offsetX + deltaX / 2;
                newOffsetY = initial.offsetY + deltaY / 2;
                break;
            case 'scale-bl':
                newWidth = Math.max(minGridDimension, initial.renderWidth - deltaX);
                newHeight = Math.max(minGridDimension, initial.renderHeight + deltaY);
                newOffsetX = initial.offsetX + deltaX / 2;
                newOffsetY = initial.offsetY + deltaY / 2;
                break;
            case 'scale-br':
                newWidth = Math.max(minGridDimension, initial.renderWidth + deltaX);
                newHeight = Math.max(minGridDimension, initial.renderHeight + deltaY);
                newOffsetX = initial.offsetX + deltaX / 2;
                newOffsetY = initial.offsetY + deltaY / 2;
                break;
        }

        gridParams.offsetX = Math.round(newOffsetX);
        gridParams.offsetY = Math.round(newOffsetY);
        gridParams.renderWidth = Math.round(newWidth);
        gridParams.renderHeight = Math.round(newHeight);

        syncSlidersToGridParams();
        requestRedraw('拖拽网格');

    } else { // Not dragging, just update hover cursor
        const mode = getInteractionMode(mousePos.x, mousePos.y);
        const newCursorClass = mode ? `canvas-${mode.startsWith('scale') ? getResizeCursor(mode) : 'grab'}` : '';
        if (interactiveCanvas.className !== newCursorClass) {
            interactiveCanvas.className = newCursorClass;
            interactiveCanvas.style.cursor = getComputedStyle(interactiveCanvas).cursor || 'default';
        }
    }
}

/**
 * 处理鼠标释放事件
 * @param {MouseEvent} event - 鼠标事件对象
 * 结束当前的拖动或缩放操作
 */
function handleMouseUp(event) {
    if (event.button !== 0) return;
    if (draggingState) {
        draggingState = null;
        const mousePos = getMousePos(interactiveCanvas, event);
        const mode = getInteractionMode(mousePos.x, mousePos.y);
        interactiveCanvas.className = mode ? `canvas-${mode.startsWith('scale') ? getResizeCursor(mode) : 'grab'}` : '';
        interactiveCanvas.style.cursor = getComputedStyle(interactiveCanvas).cursor || 'default';
        requestRedraw('拖拽结束');
    }
}

/**
 * 处理鼠标离开画布事件
 * @param {MouseEvent} event - 鼠标事件对象
 * 结束当前的拖动操作并重置光标状态
 */
function handleMouseLeave(event) {
    if (draggingState) {
        handleMouseUp(event);
    }
    interactiveCanvas.className = '';
    interactiveCanvas.style.cursor = 'default';
}

/**
 * 获取调整大小的光标类型
 * @param {string} mode - 交互模式
 * @returns {string} 对应的CSS光标类型
 */
function getResizeCursor(mode) {
    switch (mode) {
        case 'scale-l': case 'scale-r': return 'resize-ew';
        case 'scale-t': case 'scale-b': return 'resize-ns';
        case 'scale-tl': case 'scale-br': return 'resize-nwse';
        case 'scale-tr': case 'scale-bl': return 'resize-nesw';
        default: return 'grab'; // Should not happen for resize modes
    }
}

/**
 * 请求重绘画布
 * @param {string} [reason='unknown'] - 重绘原因
 * 使用防抖技术优化性能
 */
function requestRedraw(reason = 'unknown') {
    clearTimeout(redrawTimeout);
    redrawTimeout = setTimeout(() => {
        drawInteractive();
    }, 16);
}

// --- 核心绘图逻辑 ---
// 处理字符渲染和网格绘制

/**
 * 将字符渲染到缓存画布
 * @param {string} character - 要渲染的字符
 * @param {number} fontSize - 字体大小
 * @returns {ImageData|null} 渲染后的图像数据或null
 */
function renderCharacterToCache(character, fontSize) {
    if (!loadedFont || !character || !fontSize || fontSize <= 0) return null;

    const glyph = loadedFont.charToGlyph(character);
    // Handle space character explicitly (return empty or minimal image data)
    if (character === ' ' || character === '\u00A0' /* non-breaking space */) {
        charRenderCanvas.width = Math.max(1, fontSize); // Fixed width for space
        charRenderCanvas.height = Math.max(1, fontSize); // Minimal height
        charCtx.clearRect(0, 0, charRenderCanvas.width, charRenderCanvas.height);
        return charCtx.getImageData(0, 0, charRenderCanvas.width, charRenderCanvas.height);
    }
    if (!glyph || !glyph.path) {
        console.warn(`Char "${character}" (code ${character.charCodeAt(0)}) has no path or glyph.`);
        return null;
    }

    // Fixed canvas size based on fontSize only
    const canvasWidth = Math.max(1, fontSize);
    const canvasHeight = Math.max(1, fontSize);

    scale = fontSize / loadedFont.unitsPerEm;
    baseline = Math.ceil(Math.max(0, loadedFont.ascender) * scale); // Ensure ascender is non-negative
    descent = Math.ceil(Math.abs(loadedFont.descender) * scale); // Ensure descender is non-negative for height calc
    glyphHeight = Math.max(1, baseline + descent); // Max height from baseline to top + baseline to bottom
    glyphAdvanceWidth = Math.max(1, glyph.advanceWidth * scale); // Use advanceWidth for layout
    fontInfoDiv.innerText = `${fontFileInput.innerText}
    baseline: ${baseline}
    descent: ${descent}
    `

    // Center position for drawing
    const drawX = 0;
    const drawY = canvasHeight - descent; // Position near bottom for baseline alignment

    charRenderCanvas.width = canvasWidth;
    charRenderCanvas.height = canvasHeight;
    charCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    charCtx.fillStyle = "black";

    try {
        // Draw glyph centered in the fixed-size canvas
        // const path = glyph.getPath(drawX, drawY, fontSize);
        // path.fill = 'black';
        // path.draw(charCtx);
        loadedFont.draw(charCtx, character, drawX, drawY, fontSize, { 'fill': 'black' });
        const imageData = charCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        // console.log(`Rendered ${character}: Canvas(${canvasWidth}x${canvasHeight}), Draw(${drawX.toFixed(1)},${drawY.toFixed(1)})`);
        return imageData;
    } catch (e) {
        console.error(`Error rendering char "${character}":`, e);
        return null;
    }
}

/**
 * 绘制交互式画布内容
 *
 * 主要功能：
 * 1. 清空并准备画布
 * 2. 渲染当前字符到缓存(如果需要)
 * 3. 绘制字符图像到交互画布
 * 4. 计算并绘制网格
 * 5. 绘制拖动控制点
 * 6. 更新状态显示
 *
 * 工作流程：
 * 1. 计算画布逻辑尺寸和中心点
 * 2. 清空画布并设置背景
 * 3. 检查是否需要重新渲染字符(字体/大小变化时)
 * 4. 如果字符有效则绘制到画布
 * 5. 计算网格位置和单元格尺寸
 * 6. 遍历网格单元格检查像素覆盖率
 * 7. 根据阈值填充单元格
 * 8. 绘制网格线和控制点
 * 9. 更新状态显示信息
 *
 * 注意：
 * - 使用displayScale处理高DPI显示
 * - 使用gridParams中的参数控制网格
 * - 状态信息显示在canvasStatusDiv中
 */
function drawInteractive() {
    // 1. 计算画布逻辑尺寸和中心点
    // 考虑设备像素比(displayScale)将物理像素转换为逻辑像素
    const logicalWidth = interactiveCanvas.width / displayScale;
    const logicalHeight = interactiveCanvas.height / displayScale;
    const canvasCenterX = logicalWidth / 2;
    const canvasCenterY = logicalHeight / 2;

    // 2. 清空画布并设置背景
    // 使用CSS定义的背景色或默认浅灰色
    iCtx.fillStyle = getComputedStyle(interactiveCanvas).backgroundColor || '#f0f0f0';
    iCtx.fillRect(0, 0, logicalWidth, logicalHeight);

    // 3. 检查字符渲染状态
    // 仅在字符和字体都有效时尝试渲染
    let canDrawChar = false;
    if (currentChar && loadedFont) {
        // 检查是否需要重新渲染字符(字体大小变化或首次渲染)
        if (!charImageData || lastRenderedFontSize !== gridParams.fontRenderSize) {
            charImageData = renderCharacterToCache(currentChar, gridParams.fontRenderSize);
            lastRenderedFontSize = charImageData ? gridParams.fontRenderSize : 0;
        }
        canDrawChar = !!charImageData; // 确定是否成功获取字符图像数据
    } else {
        charImageData = null;
        lastRenderedFontSize = 0;
    }

    // 计算字符绘制位置(默认居中)
    let imgDrawX = canvasCenterX, imgDrawY = canvasCenterY;
    if (canDrawChar) {
        imgDrawX = canvasCenterX - charRenderCanvas.width / 2; // Center the hidden canvas
        imgDrawY = canvasCenterY - charRenderCanvas.height / 2;
        iCtx.drawImage(charRenderCanvas, imgDrawX, imgDrawY);
    }

    // 计算网格边界位置
    // 使用字体真实宽度(glyph.advanceWidth)而非渲染宽度
    // 确保网格宽度与字符实际宽度匹配
    const gridLeft = canvasCenterX + gridParams.offsetX - charRenderCanvas.width / 2;
    const gridRight = gridLeft + gridParams.renderWidth;
    // const gridTop = canvasCenterY + gridParams.offsetY - gridParams.renderHeight / 2;
    const gridBottom = canvasCenterY + gridParams.offsetY + charRenderCanvas.height / 2 - descent;
    const gridTop = gridBottom - gridParams.renderHeight;
    // const gridBottom = gridTop + gridParams.renderHeight;
    // 计算每个网格单元格的宽度和高度
    // 防止除零错误(cols或rows为0时)
    const cellWidth = gridParams.cols > 0 ? gridParams.renderWidth / gridParams.cols : 0;
    const cellHeight = gridParams.rows > 0 ? gridParams.renderHeight / gridParams.rows : 0;

    // 初始化预览矩阵，用于存储每个单元格的填充状态(0/1)
    const previewMatrix = [];
    // 设置网格绘制样式
    // 填充色: 半透明蓝色
    // 边框色: 半透明深灰色
    // 线宽: 考虑显示缩放比例
    iCtx.fillStyle = 'rgba(0, 100, 255, 0.35)';
    iCtx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    iCtx.lineWidth = 1 / displayScale;

    // 仅在单元格尺寸有效时绘制网格
    if (cellWidth > 0 && cellHeight > 0) {
        for (let r = 0; r < gridParams.rows; r++) {
            const row = [];
            for (let c = 0; c < gridParams.cols; c++) {
                const cellX = gridLeft + c * cellWidth;
                const cellY = gridTop + r * cellHeight;
                let filled = 0;
                if (canDrawChar) {
                    // 计算检查区域(相对于隐藏画布的左上角)
                    // 检查当前单元格内像素覆盖率是否达到阈值
                    const checkArea = { x: cellX - imgDrawX, y: cellY - imgDrawY, w: cellWidth, h: cellHeight };
                    filled = checkPixelCoverage(charImageData, checkArea, gridParams.threshold) ? 1 : 0;
                    if (filled) iCtx.fillRect(cellX, cellY, cellWidth, cellHeight);
                }
                row.push(filled);
                iCtx.strokeRect(cellX, cellY, cellWidth, cellHeight);
            }
            previewMatrix.push(row);
        }
    }

    // 如果字体和字符都有效，则绘制拖动控制点
    if (loadedFont && currentChar) {
        drawDragHandles(gridLeft, gridTop, gridRight, gridBottom);
    }

    // 格式化并显示预览矩阵
    singleCharMatrixPreviewPre.textContent = formatMatrix(previewMatrix, true);

    // 根据当前状态更新画布状态信息
    if (!loadedFont) setCanvasStatus('请加载字体文件。');
    else if (!currentChar) setCanvasStatus('请输入交互预览字符。', 'warn');
    else if (!canDrawChar && currentChar) setCanvasStatus(`无法渲染交互字符 "${currentChar}"`, 'error');
    else setCanvasStatus(`交互预览: "${currentChar}" | 网格: ${gridParams.cols}x${gridParams.rows} | 阈值: ${Math.round(gridParams.threshold * 100)}%`);
}

/**
 * 绘制拖动控制点
 * @param {number} left - 左边界
 * @param {number} top - 上边界
 * @param {number} right - 右边界
 * @param {number} bottom - 下边界
 */
function drawDragHandles(left, top, right, bottom) {
    iCtx.fillStyle = 'rgba(0, 0, 255, 0.6)';
    const hs = handleSize * 0.75; // Visual size
    const hs2 = hs / 2;

    const corners = [
        [left - hs2, top - hs2], [right - hs2, top - hs2],
        [left - hs2, bottom - hs2], [right - hs2, bottom - hs2]
    ];
    // Draw mid-point handles only if grid is large enough
    const midpoints = [];
    if (right - left > hs * 2) { // Enough horizontal space for top/bottom mids
        midpoints.push([left + (right - left) / 2 - hs2, top - hs2]);
        midpoints.push([left + (right - left) / 2 - hs2, bottom - hs2]);
    }
    if (bottom - top > hs * 2) { // Enough vertical space for left/right mids
        midpoints.push([left - hs2, top + (bottom - top) / 2 - hs2]);
        midpoints.push([right - hs2, top + (bottom - top) / 2 - hs2]);
    }

    [...corners, ...midpoints].forEach(([x, y]) => { iCtx.fillRect(x, y, hs, hs); });
}

// --- 像素覆盖率检查 ---
// 检查网格单元内像素填充率是否达到阈值
/**
 * 检查像素覆盖率
 * @param {ImageData} imageData - 图像数据
 * @param {Object} area - 检查区域
 * @param {number} thresholdPct - 阈值百分比
 * @returns {boolean} 是否达到覆盖率阈值
 */
function checkPixelCoverage(imageData, area, thresholdPct) {
    if (!imageData || !imageData.data) return false; // Add check for imageData.data
    const data = imageData.data;
    const imgWidth = imageData.width;
    const imgHeight = imageData.height;
    // Floor/Ceil ensure we check all pixels potentially overlapping the area
    const startX = Math.max(0, Math.floor(area.x));
    const startY = Math.max(0, Math.floor(area.y));
    const endX = Math.min(imgWidth, Math.ceil(area.x + area.w));
    const endY = Math.min(imgHeight, Math.ceil(area.y + area.h));

    let filledPixelCount = 0;
    let totalCheckedPixelCount = 0;

    if (startX >= endX || startY >= endY) return false; // Area is outside or has no dimension

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const index = (y * imgWidth + x) * 4;
            // Check alpha channel (index + 3)
            // Consider a pixel filled if its alpha is >= half (128), adjust as needed
            const alpha = data[index + 3];
            if (alpha >= 128) {
                filledPixelCount++;
            }
            totalCheckedPixelCount++;
        }
    }

    if (totalCheckedPixelCount === 0) return false; // Avoid division by zero

    const fillRatio = filledPixelCount / totalCheckedPixelCount;
    return fillRatio >= thresholdPct;
}

// --- 批量生成逻辑(使用交互网格) ---
// 批量处理所有输入字符并生成矩阵
/**
 * 处理"生成全部"按钮点击事件
 * 批量处理所有输入的字符并生成矩阵
 */
async function handleGenerateAllClick() {
    if (!loadedFont) {
        setBatchStatus("请先加载字体文件。", "error");
        return;
    }

    const uniqueChars = [...new Set(charsToProcessTextarea.value.replace(/[^\S ]/g, ''))];
    if (uniqueChars.length === 0) {
        setBatchStatus("请输入要处理的字符列表。", "warn");
        return;
    }

    // Use the INTERACTIVE grid parameters directly
    const batchGridParams = {
        rows: gridParams.rows,
        cols: gridParams.cols,
        threshold: gridParams.threshold,
        fontSize: gridParams.fontRenderSize,
        offsetX: gridParams.offsetX,
        offsetY: gridParams.offsetY,
        renderWidth: gridParams.renderWidth,
        renderHeight: gridParams.renderHeight
    };

    if (batchGridParams.rows <= 0 || batchGridParams.cols <= 0 || batchGridParams.fontSize <= 0 || batchGridParams.renderWidth <= 0 || batchGridParams.renderHeight <= 0) {
        setBatchStatus("请确保行/列数、字体大小和网格宽度/高度为正数。", "error");
        return;
    }

    setBatchStatus(`准备处理 ${uniqueChars.length} 个字符 (使用交互网格)...`);
    generateAllBtn.disabled = true;
    outputMatrixPre.textContent = "处理中...";
    copyMatrixBtn.disabled = true;

    const allCharMatrices = {};
    let processedCount = 0;
    const totalCount = uniqueChars.length;
    const startTime = Date.now();

    const cellWidth = batchGridParams.renderWidth / batchGridParams.cols;
    const cellHeight = batchGridParams.renderHeight / batchGridParams.rows;

    await new Promise(resolve => setTimeout(resolve, 20)); // UI update yield

    for (const char of uniqueChars) {
        // 1. Render character to hidden canvas
        const imageData = renderCharacterToCache(char, batchGridParams.fontSize);
        let matrix = Array.from({ length: batchGridParams.rows }, () => Array(batchGridParams.cols).fill(0));

        if (imageData) {
            const hiddenCanvasWidth = imageData.width;
            const hiddenCanvasHeight = imageData.height;

            // 2. Calculate positions relative to a conceptual center (0,0)
            const imgDrawX_relative = -hiddenCanvasWidth / 2; // Top-left of centered image relative to center
            const imgDrawY_relative = -hiddenCanvasHeight / 2;

            const gridLeft_relative = batchGridParams.offsetX; // Top-left of grid relative to center
            const gridTop_relative = hiddenCanvasHeight - descent - batchGridParams.renderHeight + batchGridParams.offsetY;

            // 3. Check coverage for each cell of the INTERACTIVE grid
            for (let r = 0; r < batchGridParams.rows; r++) {
                for (let c = 0; c < batchGridParams.cols; c++) {
                    // Cell's top-left relative to the conceptual center
                    const cellX_relative = gridLeft_relative + c * cellWidth;
                    const cellY_relative = gridTop_relative + r * cellHeight;

                    // Check area's top-left relative to the RENDERED IMAGE's top-left
                    // This mimics the calculation in drawInteractive's checkPixelCoverage call
                    // const checkAreaX = cellX_relative - imgDrawX_relative;
                    // const checkAreaY = cellY_relative - imgDrawY_relative;

                    const checkArea = {
                        x: cellX_relative, y: cellY_relative,
                        w: cellWidth, h: cellHeight
                    };

                    if (checkPixelCoverage(imageData, checkArea, batchGridParams.threshold)) {
                        matrix[r][c] = 1;
                    }
                }
            }
            if (shouldTrimColumns) {
                matrix = trimZeroColumns(matrix);
            }
        } // else: imageData is null (render failed), matrix remains zeros

        allCharMatrices[char] = matrix;

        processedCount++;
        if (processedCount % 5 === 0 || processedCount === totalCount) {
            setBatchStatus(`处理中: ${char} (${processedCount}/${totalCount})`);
            await new Promise(resolve => setTimeout(resolve, 0)); // Yield loop
        }
    }

    // 4. Manually format and display final output string for better readability
    try {
        let outputString = "{\n";
        const entries = Object.entries(allCharMatrices);
        entries.forEach(([char, matrix], index) => {
            // Get the multi-line formatted string for the matrix
            const formattedMatrixStr = formatMatrix(matrix, true);
            // Escape the character key for JSON compatibility
            const escapedCharKey = JSON.stringify(char);
            // Indent the key and add the directly formatted matrix string
            // Note: The matrix part is not a standard JSON string value here
            outputString += `  ${escapedCharKey}: ${formattedMatrixStr}`;
            if (index < entries.length - 1) {
                outputString += ",\n"; // Add comma and newline between entries
            } else {
                outputString += "\n"; // Add newline after the last entry
            }
        });
        outputString += "}";

        // Set the manually constructed string to the <pre> element
        outputMatrixPre.textContent = outputString;

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        setBatchStatus(`✓ 处理完成 ${processedCount} 个字符 (${duration} 秒)`, "success");
        copyMatrixBtn.disabled = false;
    } catch (e) {
        console.error("Error stringifying batch output:", e);
        outputMatrixPre.textContent = "错误：无法生成最终 JSON 输出。";
        setBatchStatus("生成 JSON 时出错。", "error");
    }

    generateAllBtn.disabled = false;
}

// --- 实用工具函数 ---
// 提供各种辅助功能的工具函数
/**
 * 格式化矩阵输出
 * @param {Array} matrix - 要格式化的矩阵
 * @param {boolean} [isPreview=false] - 是否为预览模式
 * @returns {string} 格式化后的矩阵字符串
 */
function trimZeroColumns(matrix) {
    if (!matrix || matrix.length === 0) return matrix;

    // Find first non-zero column from left
    let left = 0;
    while (left < matrix[0].length) {
        const allZero = matrix.every(row => row[left] === 0);
        if (!allZero) break;
        left++;
    }

    // Find first non-zero column from right
    let right = matrix[0].length - 1;
    while (right >= 0) {
        const allZero = matrix.every(row => row[right] === 0);
        if (!allZero) break;
        right--;
    }

    // If matrix is all zero, use spaceWidth
    if (left > right) {
        right = Math.min(matrix[0].length - 1, gridParams.spaceWidth - 1);
        left = 0;
    }

    // Slice matrix columns between left and right (inclusive)
    return matrix.map(row => row.slice(left, right + 1));
}

function formatMatrix(matrix, isPreview = false) {
    matrix = trimZeroColumns(matrix);
    if (!matrix || matrix.length === 0) return '[ ]';
    if (isPreview) {
        // if (matrix.length > 16 || (matrix[0] && matrix[0].length > 24)) {
        //     return `[ ${matrix.length}x${matrix[0]?.length || 0} matrix ]`;
        // } else {
        let str = "[\n";
        matrix.forEach((row, index) => {
            str += `  [${row.join(',')}]${index < matrix.length - 1 ? ',' : ''}\n`;
        });
        str += "]";
        return str;
        // }
    } else {
        return JSON.stringify(matrix); // Fallback (not really used anymore for batch)
    }
}

/**
 * 清空交互式画布
 * 重置画布背景并清除内容
 */
function clearInteractiveCanvas() {
    const logicalWidth = interactiveCanvas.width / displayScale;
    const logicalHeight = interactiveCanvas.height / displayScale;
    iCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    iCtx.fillStyle = getComputedStyle(interactiveCanvas).backgroundColor || '#f0f0f0';
    iCtx.fillRect(0, 0, logicalWidth, logicalHeight);
    singleCharMatrixPreviewPre.textContent = '[ ]';
}

// 初始化事件监听器
trimColumnsCheckbox.addEventListener('change', function (e) {
    shouldTrimColumns = e.target.checked;
});

/**
 * 设置画布状态信息
 * @param {string} message - 要显示的消息
 * @param {string} [type='info'] - 消息类型(info/warn/error)
 */
function setCanvasStatus(message, type = 'info') {
    canvasStatusDiv.textContent = message;
    canvasStatusDiv.className = `status-info ${type}`;
}
/**
 * 设置批量处理状态信息
 * @param {string} message - 要显示的消息
 * @param {string} [type='info'] - 消息类型(info/warn/error)
 */
function setBatchStatus(message, type = 'info') {
    batchStatusDiv.textContent = message;
    batchStatusDiv.className = `status-info ${type}`;
}
/**
 * 设置复制状态信息
 * @param {string} message - 要显示的消息
 * @param {string} [type='info'] - 消息类型(info/warn/error)
 */
function setCopyStatus(message, type = 'info') {
    copyStatusDiv.textContent = message;
    copyStatusDiv.className = `status-info ${type}`;
    setTimeout(() => { copyStatusDiv.textContent = ''; copyStatusDiv.className = 'status-info'; }, 3000);
}

function copyMatrix() {
    const batchJson = outputMatrixPre.textContent;
    if (!batchJson || batchJson === '[ ]' || batchJson === '处理中...') {
        setCopyStatus('没有批处理结果可复制。', 'warn');
        return;
    }
    // 先尝试现代 Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(batchJson)
            .then(() => { setCopyStatus('批处理结果已复制！', 'success'); })
            .catch(err => {
                console.error('Clipboard API 失败:', err);
                // 回退到 document.execCommand 方法
                fallbackCopyText(batchJson);
            });
    } else {
        // 不支持 Clipboard API 直接使用 fallback
        fallbackCopyText(batchJson);
    }

    function fallbackCopyText(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setCopyStatus('批处理结果已复制！', 'success');
            } else {
                throw new Error('execCommand 失败');
            }
        } catch (err) {
            console.error('Fallback 复制失败:', err);
            setCopyStatus('复制失败: ' + err.message, 'error');
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

// --- Initial Draw Trigger ---
setTimeout(() => requestRedraw('初始化'), 50);