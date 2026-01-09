 function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const shuffleArray = (array) => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
};


function playNextQuestion(data, value) {
  if (value >= data.length) {
    return value = 0;
  }

  return value + 1;

}



export { shuffleArray, playNextQuestion };