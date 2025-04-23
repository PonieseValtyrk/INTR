function changePresetValue(xInterval, yInterval, xDotSize, yDotSize, xDotUnusedSize, yDotUnusedSize, dotColor, dotUnusedColor, backgroundColor, Spacing, inputText) {
  document.getElementById('xInterval').value = xInterval;
  document.getElementById('yInterval').value = yInterval;
  document.getElementById('xDotSize').value = xDotSize;
  document.getElementById('yDotSize').value = yDotSize;
  document.getElementById('xDotUnusedSize').value = xDotUnusedSize;
  document.getElementById('yDotUnusedSize').value = yDotUnusedSize;
  document.getElementById('dotColor').value = dotColor;
  document.getElementById('dotUnusedColor').value = dotUnusedColor;
  document.getElementById('backgroundColor').value = backgroundColor;
  document.getElementById('Spacing').value = Spacing;
  document.getElementById('inputText').value = inputText;
}

  let applyPreset = document.getElementById('presetSelect');
  applyPreset.addEventListener('change', function() {
    let preset = applyPreset.value;

    switch(preset) {
      case 'preset1':
        changePresetValue(3, 3, 3, 3, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset2':
        changePresetValue(3, 3, 5, 5, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset3':
        changePresetValue(3, 3, 6, 6, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset4':
        changePresetValue(3, 3, 9, 9, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset5':
        changePresetValue(3, 3, 13, 13, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset6':
        changePresetValue(4, 7, 10, 3, 8, 5, '#FF00FF', '#00FFFF', '#FFFFFF', 1, 'INTER');
        break;
      case 'preset7':
        changePresetValue(6, 5, 4, 4, 15, 15, '#FF00FF', '#00FFFF', '#FFFFFF', 1, 'INTER');
        break;
      case 'preset8':
        changePresetValue(5, 5.5, 20, 23, 7, 7, '#FF00FF', '#00FFFF', '#FFFFFF', 1, 'INTER');
        break;
      case 'preset9':
        changePresetValue(4, 7, 8, 11, 2, 6.5, '#FF00FF', '#00FFFF', '#FFFFFF', 1, 'INTER');
        break;
      case 'preset10':
        changePresetValue(6, 3, 12, 3, 0, 0, '#000000', '#000000', '#FFFFFF', 1, 'HORIZONTAL');
        break;
      case 'preset11':
        changePresetValue(4, 7, 3, 14, 0, 0, '#000000', '#000000', '#FFFFFF', 1, 'VERTICAL');
        break;
      case 'preset12':
        changePresetValue(5, 5, 6, 10, 10, 6, '#000000', '#FF0000', '#FFFFFF', 0, '########################\n########################\n########################\n########################\n########################\n########################\n########################\n########################');
        break;
      case 'preset13':
        changePresetValue(4, 4, 8, 9, -9, 4, '#FFFFFF', '#FFFFFF', '#000000', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset14':
        changePresetValue(4, 4, 8, 4, -9, 8, '#FFFFFF', '#FFFFFF', '#000000', 0, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset15':
        changePresetValue(4, 4, 4, 8, 8, 4, '#FFFFFF', '#FFFFFF', '#000000', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset16':
        changePresetValue(4, 4, 1, 8, 8, 1, '#FFFFFF', '#FFFFFF', '#000000', 1, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset17':
        changePresetValue(4, 4, 4, 8, -8, 12, '#FFFFFF', '#FFFFFF', '#000000', 0, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset18':
        changePresetValue(2, 3, 10, 6, -4, -7, '#000000', '#FFFFFF', '#FFFFFF', 3, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset19':
        changePresetValue(2, 3, 10, 6, -2, -7, '#000000', '#FFFFFF', '#FFFFFF', 3, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset20':
        changePresetValue(2, 2, 6, 16, 3, 8, '#00FFFF', '#FF0000', '#000000', 2, 'AaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
        break;
      case 'preset21':
        changePresetValue(5, 7, 26, 14, -10, -14, '#000000', '#FFFFFF', '#FFFFFF', 6, 'THIS PAPER STRIP\nthis paper strip');
        break;
      case 'preset22':
        changePresetValue(5, 7, 26, 14, -10, -14, '#000000', '#000000', '#FFFFFF', 6, 'THIS PAPER STRIP\nthis paper strip');
        break;
      case 'preset23':
        changePresetValue(3, 3, 13, 13, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', 1, 'IIIIIIIII {}{}{} ()()() [][][]\nNNNNNNNNN *-*-*-*-*-*-*\nTTTTTTTTT ?????MMMMSMMMMM\nEEEEEEEEE /|\\/|\\/|\\/|\\/|\\\nRRRRRRRRRNAAAAAAATSSSSSSSSARRRRR\nOOO OO0 000 0OO OOO 000\nER32SR5R9E PFQ7 YYXXXXYYXYYXYXXYYX\n@@@g @@@g @@@g Qboqg Qboqg \nqggggggp qggggggp\n_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_\n jljljljljl jljljljljl jljljljljl\n-=<>=-=<>=-=<>=-=<>=-=<>=-\n%^%^%^%^% %*%*%*%*\nzszsilszszszsilszszszsilszsz');
        break;
      case 'preset24':
        changePresetValue(3, 4, 13, 13, 4, 4, '#000000', '#FFFFFF', '#FFFFFF', -2, '\n  //////////    ___   ___   \n /"""""""""\\   < * > < * >. \n |^--^--   |       /.       \n | *  *    /\\      LJ.      \n (  ^    ) )j    / __ \\.    \n | L__J    /   \\_ /__\\ _/   \n  \\______/|      \\____/     \n    |.    |                 ');
        break;
      case 'preset25':
        changePresetValue(5, 6, 16, -7.5, 16, 2.5, '#000000', '#000000', '#FFFFFF', 0, 'Hello');
        break;
      default:
        changePresetValue(5, 4, 10, 4, 0, 0, '#FFFFFF', '#FFFFFF', '#000000', 1, 'Alternative\nModes of\nPublishing/\nReading\nin the\nPost-Digital\nAge\nAaBbCcDdEeFf\nGgHhIiJjKkLlMm\nNnOoPpQqRrSs\nTtUuVvWwXxYyZz\n1234567890\n');
    }
  })
