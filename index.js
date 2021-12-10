const { StaticPool } = require("node-worker-threads-pool");
const LineByLineReader = require("line-by-line");
const lr = new LineByLineReader("big.txt");

const filePath = "./worker.js";
const pool = new StaticPool({
  size: 4,
  task: filePath,
  workerData: "workerData!",
});

// Aggregates the results from all the matchers(threads) and prints the results
const aggregator = (arrayOfNameMaps) => {
  const resultedNamesMap = new Map();
  arrayOfNameMaps.forEach((mapElement) => {
    mapElement.forEach(function (value, key) {
      resultedNamesMap.has(key)
        ? resultedNamesMap.set(key, [...resultedNamesMap.get(key), ...value])
        : resultedNamesMap.set(key, value);
    });
  });
  console.log(resultedNamesMap);
  return resultedNamesMap;
};

// Read file line by line (optimized for memory) and send 1000 lines of strings into matchers (thread pool)and get the resulsts returned from each matcher
const mainThread = async () => {
  const arrayOfNameMaps = [];
  let counterLines = 0;
  let string = "";

  lr.on("error", function (err) {
    console.error(err);
  });
  lr.on("line", function (line) {
    counterLines++;
    string += line + "\n";
    if (counterLines % 1000 === 0) {
      (async () => {
        const threadString = string;
        string = "";
        const numberOfLines = counterLines - 1000;
        // This will choose the main thread!one idle worker in the pool
        // to execute your heavy task without blocking
        const matcherResponse = await pool.exec({
          threadString,
          numberOfLines,
        });
        arrayOfNameMaps.push(matcherResponse);
      })();
    }
  });

  lr.on("end", function () {
    (async () => {
      const threadString = string;
      const numberOfLines = counterLines - 1000;
      const matcherResponse = await pool.exec({ threadString, numberOfLines });
      arrayOfNameMaps.push(matcherResponse);
      aggregator(arrayOfNameMaps);
      pool.destroy();
    })(); // All lines are read, file is closed now.s
  });
};

mainThread();
