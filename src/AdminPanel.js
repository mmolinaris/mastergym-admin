const SHEET_CLIENTI  = "clienti";
const SHEET_SCHEDE   = "schede";
const SHEET_ESERCIZI = "esercizi";

/* ------------------------------------------------
   ENTRY POINT
   ------------------------------------------------ */
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    if      (action === "addCliente")           result = addCliente(body.cliente);
    else if (action === "updateCliente")         result = updateCliente(body.cliente);
    else if (action === "deleteCliente")         result = deleteCliente(body.codice);
    else if (action === "addEsercizio")          result = addEsercizio(body.esercizio);
    else if (action === "updateEsercizio")       result = updateEsercizio(body.esercizio);
    else if (action === "deleteEsercizio")       result = deleteEsercizio(body.esercizio);
    else if (action === "deleteSchedaPassata")   result = deleteSchedaPassata(body.codiceCliente, body.schedaId);
    else if (action === "deleteSchedaCompleta")  result = deleteSchedaCompleta(body.schedaId);
    else if (action === "creaSchedaDaTemplate")  result = creaSchedaDaTemplate(body.cliente_codice, body.scheda_attiva_old, body.scheda, body.esercizi);
    else throw new Error("Azione non riconosciuta: " + action);

    return okResponse(result);
  } catch (err) {
    return errResponse(err.message);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "GymBoard Script v2 attivo!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================================================
   CLIENTI
   ================================================ */

function addCliente(cliente) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const row     = headers.map(h => cliente[h] || "");
  sheet.appendRow(row);
  return { success: true, message: "Cliente aggiunto: " + cliente.codice };
}

function updateCliente(cliente) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxCodice = headers.indexOf("codice");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxCodice]).trim() === String(cliente.codice).trim()) {
      headers.forEach((h, col) => {
        if (cliente[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(cliente[h]);
        }
      });
      return { success: true, message: "Cliente aggiornato: " + cliente.codice };
    }
  }
  throw new Error("Cliente non trovato: " + cliente.codice);
}

function deleteCliente(codice) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("codice");

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(codice).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Cliente eliminato: " + codice };
    }
  }
  throw new Error("Cliente non trovato: " + codice);
}

/* ================================================
   ESERCIZI
   ================================================ */

function addEsercizio(ex) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const row     = headers.map(h => ex[h] || "");
  sheet.appendRow(row);
  return { success: true, message: "Esercizio aggiunto" };
}

function updateEsercizio(ex) {
  const sheet    = getSheet(SHEET_ESERCIZI);
  const headers  = getHeaders(sheet);
  const data     = sheet.getDataRange().getValues();
  const idxSch   = headers.indexOf("scheda_id");
  const idxEx    = headers.indexOf("esercizio");
  const idxSed   = headers.indexOf("seduta");

  for (let i = 1; i < data.length; i++) {
    const matchScheda  = !ex.scheda_id || String(data[i][idxSch]).trim() === String(ex.scheda_id).trim();
    const matchEx      = String(data[i][idxEx]).trim() === String(ex.esercizio).trim();
    const matchSeduta  = idxSed < 0 || !ex.seduta || String(data[i][idxSed]).trim() === String(ex.seduta).trim();

    if (matchScheda && matchEx && matchSeduta) {
      headers.forEach((h, col) => {
        if (ex[h] !== undefined) sheet.getRange(i + 1, col + 1).setValue(ex[h]);
      });
      return { success: true, message: "Esercizio aggiornato" };
    }
  }
  throw new Error("Esercizio non trovato: " + ex.esercizio);
}

function deleteEsercizio(ex) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxSch  = headers.indexOf("scheda_id");
  const idxEx   = headers.indexOf("esercizio");

  for (let i = data.length - 1; i >= 1; i--) {
    const matchScheda = !ex.scheda_id || String(data[i][idxSch]).trim() === String(ex.scheda_id).trim();
    const matchEx     = String(data[i][idxEx]).trim() === String(ex.esercizio).trim();
    if (matchScheda && matchEx) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Esercizio eliminato" };
    }
  }
  throw new Error("Esercizio non trovato: " + ex.esercizio);
}

/* ================================================
   SCHEDE PASSATE
   ================================================ */

function deleteSchedaPassata(codiceCliente, schedaId) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxCod  = headers.indexOf("codice");
  const idxPass = headers.indexOf("schede_passate");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxCod]).trim() === String(codiceCliente).trim()) {
      const passate = String(data[i][idxPass] || "").split(",").map(s => s.trim()).filter(s => s && s !== schedaId).join(",");
      sheet.getRange(i + 1, idxPass + 1).setValue(passate);
      eliminaEserciziScheda(schedaId);
      eliminaRigaScheda(schedaId);
      return { success: true, message: "Scheda passata eliminata" };
    }
  }
  throw new Error("Cliente non trovato: " + codiceCliente);
}

function deleteSchedaCompleta(schedaId) {
  // Rimuovi da clienti (scheda_attiva e schede_passate)
  const sheetC  = getSheet(SHEET_CLIENTI);
  const headersC = getHeaders(sheetC);
  const dataC   = sheetC.getDataRange().getValues();
  const idxAtt  = headersC.indexOf("scheda_attiva");
  const idxPass = headersC.indexOf("schede_passate");

  for (let i = 1; i < dataC.length; i++) {
    if (String(dataC[i][idxAtt]).trim() === String(schedaId).trim()) {
      sheetC.getRange(i + 1, idxAtt + 1).setValue("");
    }
    const passate = String(dataC[i][idxPass] || "").split(",").map(s => s.trim()).filter(s => s && s !== schedaId).join(",");
    sheetC.getRange(i + 1, idxPass + 1).setValue(passate);
  }

  eliminaEserciziScheda(schedaId);
  eliminaRigaScheda(schedaId);
  return { success: true, message: "Scheda eliminata: " + schedaId };
}

/* ================================================
   CREA SCHEDA DA TEMPLATE
   ================================================ */

function creaSchedaDaTemplate(codiceCliente, schedaAttivaOld, scheda, esercizi) {
  // 1. Scrivi scheda
  const sheetS   = getSheet(SHEET_SCHEDE);
  const headersS = getHeaders(sheetS);
  sheetS.appendRow(headersS.map(h => scheda[h] || ""));

  // 2. Scrivi esercizi
  const sheetE   = getSheet(SHEET_ESERCIZI);
  const headersE = getHeaders(sheetE);
  esercizi.forEach(ex => sheetE.appendRow(headersE.map(h => ex[h] || "")));

  // 3. Aggiorna cliente
  const sheetC   = getSheet(SHEET_CLIENTI);
  const headersC = getHeaders(sheetC);
  const dataC    = sheetC.getDataRange().getValues();
  const idxCod   = headersC.indexOf("codice");
  const idxAtt   = headersC.indexOf("scheda_attiva");
  const idxPass  = headersC.indexOf("schede_passate");

  for (let i = 1; i < dataC.length; i++) {
    if (String(dataC[i][idxCod]).trim() === String(codiceCliente).trim()) {
      if (schedaAttivaOld) {
        const passate = String(dataC[i][idxPass] || "");
        sheetC.getRange(i + 1, idxPass + 1).setValue(passate ? passate + "," + schedaAttivaOld : schedaAttivaOld);
      }
      sheetC.getRange(i + 1, idxAtt + 1).setValue(scheda.scheda_id);
      return { success: true, message: "Scheda creata e assegnata a " + codiceCliente };
    }
  }
  throw new Error("Cliente non trovato: " + codiceCliente);
}

/* ================================================
   HELPERS
   ================================================ */

function getSheet(name) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Foglio non trovato: " + name);
  return sheet;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
}

function eliminaEserciziScheda(schedaId) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("scheda_id");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(schedaId).trim()) sheet.deleteRow(i + 1);
  }
}

function eliminaRigaScheda(schedaId) {
  const sheet   = getSheet(SHEET_SCHEDE);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("scheda_id");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(schedaId).trim()) sheet.deleteRow(i + 1);
  }
}

function okResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", data })).setMimeType(ContentService.MimeType.JSON);
}

function errResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message })).setMimeType(ContentService.MimeType.JSON);
}
