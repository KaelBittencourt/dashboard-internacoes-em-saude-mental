// ============================================
// COLE ESTE CÓDIGO NO GOOGLE APPS SCRIPT
// ============================================

const SHEET_NAME = "Página1";

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const sheet = getSheet();
  let result;

  try {
    const params = e.parameter || {};
    const action = params.action || "read";

    if (action === "read") {
      result = readAll(sheet);
    } else if (action === "add") {
      const data = JSON.parse(e.postData.contents);
      result = addRow(sheet, data);
    } else if (action === "update") {
      const data = JSON.parse(e.postData.contents);
      const row = parseInt(params.row);
      result = updateRow(sheet, row, data);
    } else if (action === "delete") {
      const row = parseInt(params.row);
      result = deleteRow(sheet, row);
    } else {
      result = { success: false, error: "Ação inválida" };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function ensureColumns(sheet, data) {
  var headers = getHeaders(sheet);
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === "_row") continue;
    if (headers.indexOf(key) === -1) {
      var nextCol = headers.length + 1;
      sheet.getRange(1, nextCol).setValue(key);
      headers.push(key);
    }
  }
  return headers;
}

function readAll(sheet) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j] !== null && data[i][j] !== undefined ? data[i][j].toString() : "";
    }
    obj._row = i + 1;
    rows.push(obj);
  }
  return { success: true, data: rows, headers: headers };
}

function addRow(sheet, data) {
  var headers = ensureColumns(sheet, data);
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    newRow.push(data[headers[i]] || "");
  }
  sheet.appendRow(newRow);
  return { success: true, message: "Registro adicionado com sucesso" };
}

function updateRow(sheet, rowNumber, data) {
  if (!rowNumber || rowNumber < 2) {
    return { success: false, error: "Número de linha inválido" };
  }
  var headers = ensureColumns(sheet, data);
  for (var i = 0; i < headers.length; i++) {
    if (data[headers[i]] !== undefined) {
      sheet.getRange(rowNumber, i + 1).setValue(data[headers[i]]);
    }
  }
  return { success: true, message: "Registro atualizado com sucesso" };
}

function deleteRow(sheet, rowNumber) {
  if (!rowNumber || rowNumber < 2) {
    return { success: false, error: "Número de linha inválido" };
  }
  sheet.deleteRow(rowNumber);
  return { success: true, message: "Registro excluído com sucesso" };
}
