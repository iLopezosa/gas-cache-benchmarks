const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const sheet = SpreadsheetApp.openById(SHEET_ID);
const cache = CacheService.getScriptCache();
const numberOfItems = 250;
function smallValueBenchmark() {
  const smallValue = createStringByKBs(1);

  // Cold test
  const coldResults = (testCaches(0, smallValue));
  
  // Hot test
  for(let i = 0; i < 250; i++)
  testCaches(0, smallValue);
  const hotResults = (testCaches(0, smallValue));

  const firstEmptyRow = sheet.getRange('Benchmarks!A4:D').getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  sheet.getRange(`Benchmarks!A${firstEmptyRow}:D${firstEmptyRow}`).setValues([[coldResults.cache.write, hotResults.cache.write, coldResults.cache.read, hotResults.cache.read]]);
  sheet.getRange(`Benchmarks!Q${firstEmptyRow}:T${firstEmptyRow}`).setValues([[coldResults.sheet.write, hotResults.sheet.write, coldResults.sheet.read, hotResults.sheet.read]]);
}

function bigValueBenchmark() {
  const bigValue = createStringByKBs(97);

  // Cold test
  const coldResults = (testCaches(97, bigValue));

  // Hot test
  for(let i = 0; i < 250; i++)
    testCaches(97, bigValue);
  const hotResults = (testCaches(97, bigValue));

  const firstEmptyRow = sheet.getRange('Benchmarks!I4:L').getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  sheet.getRange(`Benchmarks!I${firstEmptyRow}:L${firstEmptyRow}`).setValues([[coldResults.cache.write, hotResults.cache.write, coldResults.cache.read, hotResults.cache.read]]);
  sheet.getRange(`Benchmarks!Y${firstEmptyRow}:AB${firstEmptyRow}`).setValues([[coldResults.sheet.write, hotResults.sheet.write, coldResults.sheet.read, hotResults.sheet.read]]);
}

function multipleSmallValuesBenchmark() {
  const smallValue = createStringByKBs(1);
  const hotResults = {
    cache: {
      write: 0,
      read: 0,
    },
    sheet: {
      write: 0,
      read:0,
    },
  };

  for(let i = 0; i < numberOfItems; i++) {
    const res = testCaches(i+250, smallValue);
    hotResults.cache.write += res.cache.write;
    hotResults.cache.read += res.cache.read;
    hotResults.sheet.write += res.sheet.write;
    hotResults.sheet.read += res.sheet.read;
  }
  
  hotResults.cache.write /= numberOfItems;
  hotResults.cache.read /= numberOfItems;
  hotResults.sheet.write /= numberOfItems;
  hotResults.sheet.read /= numberOfItems;
  const firstEmptyRow = sheet.getRange('Benchmarks!E4:H').getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  sheet.getRange(`Benchmarks!E${firstEmptyRow}:H${firstEmptyRow}`).setValues([[hotResults.cache.write, '', hotResults.cache.read, '']]);
  sheet.getRange(`Benchmarks!U${firstEmptyRow}:X${firstEmptyRow}`).setValues([[hotResults.sheet.write, '', hotResults.sheet.read, '']]);
}

function multipleBigValuesBenchmark() {
  const bigValue = createStringByKBs(97);
  const hotResults = {
    cache: {
      write: 0,
      read: 0,
    },
    sheet: {
      write: 0,
      read:0,
    },
  };

  for(let i = 0; i < numberOfItems; i++) {
    const res = testCaches(i, bigValue);
    hotResults.cache.write += res.cache.write;
    hotResults.cache.read += res.cache.read;
    hotResults.sheet.write += res.sheet.write;
    hotResults.sheet.read += res.sheet.read;
  }
  
  hotResults.cache.write /= numberOfItems;
  hotResults.cache.read /= numberOfItems;
  hotResults.sheet.write /= numberOfItems;
  hotResults.sheet.read /= numberOfItems;

  const firstEmptyRow = sheet.getRange('Benchmarks!M4:P').getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  sheet.getRange(`Benchmarks!M${firstEmptyRow}:P${firstEmptyRow}`).setValues([[hotResults.cache.write, '', hotResults.cache.read, '']]);
  sheet.getRange(`Benchmarks!AC${firstEmptyRow}:AF${firstEmptyRow}`).setValues([[hotResults.sheet.write, '', hotResults.sheet.read, '']]);
}

function testCaches(key, value) {
  const res = {
    cache: {
      write: 0,
      read: 0,
    },
    sheet: {
      write: 0,
      read:0,
    },
  }
  const smallItem = createStringByKBs(1);
  
  let start = Date.now();
  writeCacheService(key, value);
  let end = Date.now();
  res.cache.write = end - start;
  
  start = Date.now();
  readCacheService(key, value);
  end = Date.now();
  res.cache.read = end - start;

  start = Date.now();
  writeSpreadsheetApp(key, value);
  end = Date.now();
  res.sheet.write = end - start;

  start = Date.now();
  readSpreadsheetApp(key, value);
  end = Date.now();
  res.sheet.read = end - start;

  return res;
}

function createStringByKBs(kbs) {
  let smallItem = "";
  for (let i = 0; i < kbs * 1024 / 2; i++)
    smallItem += i % 10;
  return smallItem;
}

function writeCacheService(key, value) {
  cache.put(key, value);
}

function readCacheService(key) {
  return cache.get(key);
}

function writeSpreadsheetApp(key, value) {
  const keyIndex = findKeyIndex(sheet, key);
  sheet.getRange(`A${keyIndex}:B${keyIndex}`).setValues([[key, value]]);
}

function readSpreadsheetApp(key) {
  const keyIndex = findKeyIndex(sheet, key);
  return sheet.getRange(`B${keyIndex}`).getValue();
}

function findKeyIndex(cache, key) {
  const keys = cache.getRange('A1:A').getValues();
  let keyIndex = keys.findIndex( row => row[0].toString() === key.toString() ) + 1;
  keyIndex = keyIndex !== 0 
    ? keyIndex
    : keys.findIndex( row => row[0].toString() === '' ) + 1;
  return keyIndex;
}
