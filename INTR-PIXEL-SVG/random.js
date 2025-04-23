function randomizeParameters() {
  // 定义颜色列表
  const colors = [
    '#000000',
    '#FFFFFF',
    '#0000FF',
    '#00FFFF',
    '#FF0000',
    '#FFFF00',
    '#00FF00',
    '#FF00FF'
  ];

  const positions = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ]

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomColorFromList(colorList) {
    const index = Math.floor(Math.random() * colorList.length);
    return colorList[index];
  }

  document.getElementById('dotColor').value = randomColorFromList(colors);
  document.getElementById('dotUnusedColor').value = randomColorFromList(colors);
  document.getElementById('xInterval').value = randomInteger(2, 5);
  document.getElementById('yInterval').value = randomInteger(2, 5);
  document.getElementById('xDotSize').value = randomInteger(-5, 5);
  document.getElementById('yDotSize').value = randomInteger(-5, 5);
  document.getElementById('xDotUnusedSize').value = randomInteger(-5, 5);
  document.getElementById('yDotUnusedSize').value = randomInteger(-5, 5);
  document.getElementById('Spacing').value = randomInteger(0, 3);
  document.getElementById('position').value = randomColorFromList(positions);
}

let randomButton = document.getElementById('random');
randomButton.addEventListener('click', randomizeParameters);

// Function to get a random character (letter, number, or symbol)
function getRandomCharacter() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?[];\',./`~';
  const index = Math.floor(Math.random() * characters.length);
  return characters.charAt(index);
}

let danceInterval;

let danceButton = document.getElementById('dance');
danceButton.addEventListener('click', function () {
  if (!danceInterval) {
    // Start the interval to execute every 1 second
    danceInterval = setInterval(function () {
      randomizeParameters();
      //const inputText = getRandomCharacter();
      //document.getElementById('inputText').value = inputText;
    }, 1000);
    danceButton.innerText = 'Stop Dance'; // Optional: Change button text to indicate it can stop the dance
  } else {
    // Stop the interval if it's already running
    clearInterval(danceInterval);
    danceInterval = null;
    danceButton.innerText = 'Dance'; // Optional: Reset button text
  }
});
