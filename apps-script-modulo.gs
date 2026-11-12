// Riceve le richieste del modulo contatti di becamacchineutensili.it,
// le scrive nel foglio Google e manda un avviso via email.

const NOME_SCHEDA = 'Richieste sito';          // creata in automatico se non esiste
const EMAIL_AVVISO = 'benedettociro@libero.it'; // lascia '' per non ricevere email

const COLONNE = ['Data', 'Nome', 'Azienda', 'Telefono', 'Email', 'Messaggio', 'Pagina'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const dati = JSON.parse(e.postData.contents);
    salvaRichiesta(dati);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function salvaRichiesta(dati) {
  const foglio = SpreadsheetApp.getActiveSpreadsheet();
  let scheda = foglio.getSheetByName(NOME_SCHEDA);
  if (!scheda) scheda = foglio.insertSheet(NOME_SCHEDA);
  if (scheda.getLastRow() === 0) {
    scheda.appendRow(COLONNE);
    scheda.setFrozenRows(1);
    scheda.getRange(1, 1, 1, COLONNE.length).setFontWeight('bold');
  }

  const riga = [
    new Date(),
    pulisci(dati.nome),
    pulisci(dati.azienda),
    pulisci(dati.telefono),
    pulisci(dati.email),
    pulisci(dati.messaggio),
    pulisci(dati.pagina),
  ];
  scheda.appendRow(riga);

  if (EMAIL_AVVISO) inviaAvviso(dati);
}

// Evita che un testo che inizia con = + - @ venga letto come formula
function pulisci(valore) {
  const testo = String(valore || '').trim();
  return /^[=+\-@]/.test(testo) ? "'" + testo : testo;
}

function inviaAvviso(dati) {
  const corpo = [
    'Nuova richiesta dal sito becamacchineutensili.it',
    '',
    'Nome: ' + (dati.nome || ''),
    'Azienda: ' + (dati.azienda || ''),
    'Telefono: ' + (dati.telefono || ''),
    'Email: ' + (dati.email || ''),
    'Pagina: ' + (dati.pagina || ''),
    '',
    'Messaggio:',
    dati.messaggio || '',
  ].join('\n');

  const opzioni = {
    to: EMAIL_AVVISO,
    subject: 'Nuova richiesta dal sito – ' + (dati.azienda || dati.nome || 'senza nome'),
    body: corpo,
  };
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dati.email || '')) opzioni.replyTo = dati.email;
  MailApp.sendEmail(opzioni);
}

// Esegui questa funzione una volta dall'editor: autorizza lo script
// e scrive una riga di prova nel foglio (e manda l'email di prova).
function prova() {
  salvaRichiesta({
    nome: 'PROVA',
    azienda: 'Test collegamento',
    telefono: '000',
    email: '',
    messaggio: 'Riga di prova: si può cancellare.',
    pagina: 'Prova dall\'editor',
  });
}
