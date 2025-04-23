import { loadUserSVG } from './INTR_v3.js'

function changePresetValue(xInterval, yInterval, svgA, svgB, svgC, svgD, svgE, svgF, backgroundColor, Spacing, inputText) {
  document.getElementById('xInterval').value = xInterval;
  document.getElementById('yInterval').value = yInterval;
  document.getElementById('svgA').value = svgA;
  document.getElementById('svgB').value = svgB;
  document.getElementById('svgC').value = svgC;
  document.getElementById('svgD').value = svgD;
  document.getElementById('svgE').value = svgE;
  document.getElementById('svgF').value = svgF;
  document.getElementById('backgroundColor').value = backgroundColor;
  document.getElementById('Spacing').value = Spacing;
  document.getElementById('inputText').value = inputText;
}

let applyPreset = document.getElementById('presetSelect');
applyPreset.addEventListener('change', function () {
  let preset = applyPreset.value;

  switch (preset) {
    case 'corner':
      changePresetValue(10, 10,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="20" height="20"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polyline points="20 0 20 20 0 20"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polyline points="20 20 0 20 0 0"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polyline points="0 20 0 0 20 0"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polyline points="0 0 20 0 20 20"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="20" height="20"/></svg>',
        '#FFFFFF', 1,
        'ABCDEFGHIJKLMN\nOPQRSTUVWXYZ\n0123456789',
      )
      document.querySelector('label[for="svgA"]').textContent = 'Point'
      document.querySelector('label[for="svgB"]').textContent = 'TopLeft'
      document.querySelector('label[for="svgC"]').textContent = 'TopRight'
      document.querySelector('label[for="svgD"]').textContent = 'BottomRight'
      document.querySelector('label[for="svgE"]').textContent = 'BottomLeft'
      document.querySelector('label[for="svgF"]').textContent = '---'
      break
    case 'circle_n_line':
      changePresetValue(10, 7.5,
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30"><rect width="20" height="30"/></svg>',
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect x="5" y="-5" width="20" height="30" transform="translate(25 -5) rotate(90)"/></svg>',
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><path d="M60,30h-20c0-5.51-4.49-10-10-10s-10,4.49-10,10H0C0,13.46,13.46,0,30,0s30,13.46,30,30Z"/></svg>',
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><path d="M30,30C13.46,30,0,16.54,0,0h20c0,5.51,4.49,10,10,10s10-4.49,10-10h20c0,16.54-13.46,30-30,30Z"/></svg>',
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30"><rect width="20" height="30"/></svg>',
        '<?xml version="1.0" encoding="UTF-8"?><svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30"><rect width="20" height="30"/></svg>',
        '#FFFFFF', 1,
        'ABCDEFGHIJKLMN\nOPQRSTUVWXYZ\n0123456789\nabcdefghijklmn\nopqrstuvwxyz',
      )
      document.querySelector('label[for="svgA"]').textContent = 'VerticalBlock'
      document.querySelector('label[for="svgB"]').textContent = 'HorizontalBlock'
      document.querySelector('label[for="svgC"]').textContent = 'UpperArc'
      document.querySelector('label[for="svgD"]').textContent = 'LowerArc'
      document.querySelector('label[for="svgE"]').textContent = '---'
      document.querySelector('label[for="svgF"]').textContent = '---'
      break
  }

  loadUserSVG(document.getElementById('svgA').value, ' ', 'svgA')
  loadUserSVG(document.getElementById('svgB').value, ' ', 'svgB')
  loadUserSVG(document.getElementById('svgC').value, ' ', 'svgC')
  loadUserSVG(document.getElementById('svgD').value, ' ', 'svgD')
  loadUserSVG(document.getElementById('svgE').value, ' ', 'svgE')
  loadUserSVG(document.getElementById('svgF').value, ' ', 'svgF')

})
