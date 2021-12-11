const { parentPort } = require("worker_threads");
const namesString =
  "James,John,Robert,Michael,William,David,Richard,Charles,Joseph,Thomas,Christopher,Daniel,Paul,Mark,Donald,George,Kenneth,Steven,Edward,Brian,Ronald,Anthony,Kevin,Jason,Matthew,Gary,Timothy,Jose,Larry,Jeffrey,Frank,Scott,Eric,Stephen,Andrew,Raymond,Gregory,Joshua,Jerry,Dennis,Walter,Patrick,Peter,Harold,Douglas,Henry,Carl,Arthur,Ryan,Roger";
const arrayOfNames = namesString.split(",");
const setNames = new Set(arrayOfNames);

// Find word in string and add it location to the map and return the map results, o(n) complexity
const findWordInString = ({ threadString, numberOfLines }) => {
  const resultedWordsMap = new Map();
  let wordChars = "";
  for (let charIndex = 0; charIndex < threadString.length; charIndex++) {
    wordChars += threadString[charIndex];
    if (setNames.has(wordChars)) {
      // If chatOffSet need to include all the file text I can count the string lengths in the main thread(like the lines count)
      // and it to pass findWordInString function and add it to charoffset property
      const resultedObj = {
        lineOffSet: numberOfLines,
        charOffSet: charIndex - wordChars.length,
      };
      resultedWordsMap.has(wordChars)
        ? resultedWordsMap.set(wordChars, [
            ...resultedWordsMap.get(wordChars),
            resultedObj,
          ])
        : resultedWordsMap.set(wordChars, [resultedObj]);
    }
    if (threadString[charIndex] === "\n") {
      numberOfLines++;
      wordChars = "";
    }
    if (threadString[charIndex] === " ") wordChars = "";
  }
  return resultedWordsMap;
};

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (param) => {
  if (typeof param.threadString !== "string") {
    console.log(param.threadString);
    throw new Error("param must be a string.");
  }
  if (typeof param.numberOfLines !== "number") {
    throw new Error("param must be a number.");
  }
  const newNamesMap = findWordInString(param);

  // return the result to main thread.
  parentPort.postMessage(newNamesMap);
});
