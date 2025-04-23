function changePresetValue(xInterval, yInterval, xDotSize, yDotSize, xDotUnusedSize, yDotUnusedSize, boolean, Spacing, inputText) {
  document.getElementById('xInterval').value = xInterval;
  document.getElementById('yInterval').value = yInterval;
  document.getElementById('xDotSize').value = xDotSize;
  document.getElementById('yDotSize').value = yDotSize;
  document.getElementById('xDotUnusedSize').value = xDotUnusedSize;
  document.getElementById('yDotUnusedSize').value = yDotUnusedSize;
  document.getElementById('boolean').value = boolean;
  document.getElementById('Spacing').value = Spacing;
  document.getElementById('inputText').value = inputText;
}

  let applyPreset = document.getElementById('presetSelect');
  applyPreset.addEventListener('change', function() {
    let preset = applyPreset.value;

    switch(preset) {
      case 'preset1':
        changePresetValue(3, 3, 3, 3, 4, 4, 'subtract', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset2':
        changePresetValue(3, 3, 5, 5, 4, 4, 'subtract', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset3':
        changePresetValue(3, 3, 6, 6, 4, 4, 'subtract', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset4':
        changePresetValue(3, 3, 9, 9, 4, 4, 'subtract', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset5':
        changePresetValue(3, 3, 13, 13, 4, 4, 'subtract', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset10':
        changePresetValue(6, 3, 12, 3, 0, 0, 'subtract', 1, 'HORIZONTAL');
        break;
      case 'preset11':
        changePresetValue(4, 7, 3, 14, 0, 0, 'subtract', 1, 'VERTICAL');
        break;
      case 'preset13':
        changePresetValue(4, 4, 8, 9, -9, 4, 'unite', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset14':
        changePresetValue(4, 4, 8, 4, -9, 8, 'unite', 0, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset15':
        changePresetValue(4, 4, 4, 8, 8, 4, 'unite', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset16':
        changePresetValue(4, 4, 1, 8, 8, 1, 'unite', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset17':
        changePresetValue(4, 4, 4, 8, -8, 12, 'unite', 0, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset18':
        changePresetValue(2, 3, 10, 6, -4, -7, 'subtract', 3, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset19':
        changePresetValue(2, 3, 10, 6, -2, -7, 'subtract', 3, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset21':
        changePresetValue(5, 7, 26, 14, -10, -14, 'unite', 6, 'THIS PAPER STRIP\nthis paper strip');
        break;
      case 'preset22':
        changePresetValue(5, 7, 26, 14, -10, -14, 'unite', 6, 'THIS PAPER STRIP\nthis paper strip');
        break;
      case 'preset25':
        changePresetValue(5, 6, 16, -7.5, 16, 2.5, 'unite', 0, 'Hello');
        break;
      default:
        changePresetValue(5, 4, 10, 4, 0, 0, 'unite', 1, 'Alternative\nModes of\nPublishing/\nReading\nin the\nPost-Digital\nAge\nAaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
    }
    
  })
