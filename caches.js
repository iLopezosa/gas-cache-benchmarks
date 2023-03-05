function writeCacheService(key, value) {
  CacheService.getScriptCache().put(key, value);
}

function readCacheService(key) {
  return CacheService.getScriptCache().get(key);
}

function writeSpreadsheetApp(key, value) {
  const cache = SpreadsheetApp.getActive();
  const keyIndex = findKeyIndex(cache, key);
  cache.getRange(`B${keyIndex}`).setValue(value);
}

function readSpreadsheetApp(key) {
  const cache = SpreadsheetApp.getActive();
  const keyIndex = findKeyIndex(key);
  return cache.getRange(`B${keyIndex}`).getValue();
}

function findKeyIndex(cache, key) {
  const keys = cache.getRange('A1:A').getValues();
  const keyIndex = keys.findIndex(row => row[0] === key) + 1;
  return keyIndex;
}
