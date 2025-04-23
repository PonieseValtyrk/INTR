const {
    parsePathString,
    transformPath,
    normalizePath,
    pathToString
} = SVGPathCommander;

function uniteGroup(group) {
    const children = group.children.slice(); // 复制一份以避免修改过程中出错
    if (children.length === 0) return null;
    let united = children[0];

    for (let i = 1; i < children.length; i++) {
        united = united.unite(children[i]);
    }

    group.remove(); // 移除原始 group
    return united;
}

export function matrixToSvg(matrix, xInterval, yInterval, xDotSize, yDotSize, xDotUnusedSize, yDotUnusedSize, bool, position) {

    let finalGroup = null; // 初始化为 null

    for (let row = 0; row < matrix.length; row++) {

        for (let col = 0; col < matrix[row].length; col++) {

            let dotX = col * xInterval;
            let dotY = row * yInterval;
            var realDotX, realDotY, realUnusedDotX, realUnusedDotY;

            // --- 位置计算逻辑保持不变 ---
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
            // --- 位置计算逻辑结束 ---

            if (matrix[row][col] === 1) {
                const rect = new paper.Path.Rectangle(new paper.Point(realDotX, realDotY), new paper.Size(xDotSize, yDotSize));
                rect.closed = true;
                if (finalGroup === null) {
                    finalGroup = rect; // 初始化 finalGroup
                } else {
                    finalGroup = finalGroup.unite(rect); // 合并并重新赋值
                }
            } else {
                const rect = new paper.Path.Rectangle(new paper.Point(realUnusedDotX, realUnusedDotY), new paper.Size(xDotUnusedSize, yDotUnusedSize));
                rect.closed = true;
                if (finalGroup === null) {
                    // 如果第一个是 0 且需要 unite，则初始化
                    if (bool === 'unite') {
                         finalGroup = rect;
                    }
                    // 如果第一个是 0 且需要 subtract，则保持 finalGroup 为 null (无法从无中减去)
                } else {
                    switch (bool) {
                        case 'unite':
                            finalGroup = finalGroup.unite(rect); // 合并并重新赋值
                            break;
                        case 'subtract':
                            finalGroup = finalGroup.subtract(rect); // 相减并重新赋值
                            break;
                    }
                }
            }
        }
    }

    // 导出为 SVG 字符串
    if (finalGroup === null) {
        // 如果 matrix 为空或所有操作后 finalGroup 仍为 null，返回空 SVG
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>';
    }
    const svgString = finalGroup.exportSVG({ asString: true });

    // 清除 Paper.js 项目以释放内存
    if (paper && paper.project) {
        paper.project.clear();
    }

    return svgString;
}

//SVG转为dPath
export function svgToD(svg, height) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const paths = doc.querySelectorAll("path");

    const dStrings = Array.from(paths)
        .map(p => p.getAttribute("d"))
        .filter(Boolean)
        .join(' ');

    // 去掉所有逗号，并用单个空格隔开参数
    const cleaned = dStrings
        .replace(/,/g, ' ')           // 逗号替换成空格
        .replace(/\s+/g, ' ')         // 多空格合并成一个
        .trim();                      // 去掉首尾空格

    const cleanedFLIPY = transformPath(cleaned, {
        translate: [0, height],//这里由于我输入的INTR_RAW是个dpath string，所以我直接把高度设置成47了，正常来说如果输入是svg完整字符串，是可以获取高度信息的
        scale: [1, -1],
    });

    var cleanedFLIPYNORMALIZED = pathToString(normalizePath(cleanedFLIPY));

    return cleanedFLIPYNORMALIZED;
}

//dPath转为OpentypePath
export function DToO(otPath, dPath, x, y, s) {
    let currentContourStarted = false;
    let commands = dPathParse(dPath)
    commands.forEach(function (cmd) {
        switch (cmd.code) {
            case 'M':
                // 如果当前已有路径，则先关闭它
                if (currentContourStarted) {
                    otPath.close();
                }
                otPath.moveTo(x + cmd.end.x * s, y + cmd.end.y * s);
                currentContourStarted = true;
                break;
            case 'L':
                otPath.lineTo(x + cmd.end.x * s, y + cmd.end.y * s);
                break;
            case 'Q':
                otPath.quadraticCurveTo(
                    x + cmd.x1 * s, y + cmd.y1 * s,
                    x + cmd.x * s, y + cmd.y * s
                );
                break;
            case 'C':
                otPath.bezierCurveTo(
                    x + cmd.cp1.x * s, y + cmd.cp1.y * s,
                    x + cmd.cp2.x * s, y + cmd.cp2.y * s,
                    x + cmd.end.x * s, y + cmd.end.y * s
                );
                break;
            case 'Z':
                otPath.close();
                currentContourStarted = false;
                break;
        }
    });

    // 如果最后一个 contour 没有显式关闭，也手动关闭一下（安全起见）
    if (currentContourStarted) {
        otPath.close();
    }
}