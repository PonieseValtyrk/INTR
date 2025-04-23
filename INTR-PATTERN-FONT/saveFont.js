const {
    parsePathString,
    transformPath,
    normalizePath,
    pathToString
} = SVGPathCommander;

export function matrixToSvg(matrix, svgA, svgB, svgC, svgD, svgE, svgF, xInterval, yInterval, scale) {

    function loadUserSVG(svgText) {
        const parser = new DOMParser();
        const svgElement = parser.parseFromString(svgText, 'image/svg+xml').documentElement;
        return paper.project.importSVG(svgElement, { expandShapes: true })
    }

    let aPath = loadUserSVG(svgA)
    let bPath = loadUserSVG(svgB)
    let cPath = loadUserSVG(svgC)
    let dPath = loadUserSVG(svgD)
    let ePath = loadUserSVG(svgE)
    let fPath = loadUserSVG(svgF)

    const Group = new paper.Group();

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {

            let dotX = (col + 1) * xInterval;
            let dotY = (row + 0.5) * yInterval;

            switch (matrix[row][col]) {
                case (1):
                    const apath = aPath.clone()
                    apath.position = new paper.Point(dotX, dotY)
                    apath.scale(scale)
                    Group.addChild(apath);
                    break
                case (2):
                    const bpath = bPath.clone()
                    bpath.position = new paper.Point(dotX, dotY)
                    bpath.scale(scale)
                    Group.addChild(bpath);
                    break
                case (3):
                    const cpath = cPath.clone()
                    cpath.position = new paper.Point(dotX, dotY)
                    cpath.scale(scale)
                    Group.addChild(cpath);
                    break
                case (4):
                    const dpath = dPath.clone()
                    dpath.position = new paper.Point(dotX, dotY)
                    dpath.scale(scale)
                    Group.addChild(dpath);
                    break
                case (5):
                    const epath = ePath.clone()
                    epath.position = new paper.Point(dotX, dotY)
                    epath.scale(scale)
                    Group.addChild(epath);
                    break
                case (6):
                    const fpath = fPath.clone()
                    fpath.position = new paper.Point(dotX, dotY)
                    fpath.scale(scale)
                    Group.addChild(fpath);
                    break
            }

        }
    }


    let finalPath = Group

    // 导出为 SVG 字符串
    const svgString = finalPath.exportSVG({ asString: true });
    
    if (paper && paper.project) {
        paper.project.clear();
    }
    
    return svgString;
}

//SVG转为dPath
export function svgToD(svg, yInterval, char) {
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

    const cleanOriginal = new SVGPathCommander(cleaned, { round: 0, origin: [0, 0, 0] }).normalize();
    let offset = (char.length * 20 * yInterval) - cleanOriginal.getBBox().y2 - cleanOriginal.getBBox().y
    const cleanedFLIPY = new SVGPathCommander(cleaned, { round: 0, origin: [0, 0, 0] }).flipY().transform( { translate: [0, offset]} ).normalize();
    console.log(cleanOriginal.toString())
    console.log(cleanedFLIPY.toString())
    return cleanedFLIPY.toString();
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

