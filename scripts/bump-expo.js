const fs = require("fs");
const path = require("path");

module.exports.readVersion = function (contents) {
  return JSON.parse(contents).expo.version;
};

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents);
  json.expo.version = version;

  // Opcional: Se quiser buildar para lojas, você também pode incrementar
  // o versionCode (Android) ou buildNumber (iOS) aqui de forma matemática.

  return JSON.stringify(json, null, 2) + "\n";
};
