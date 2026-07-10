/**
 * Gestione del cookie tecnico di preferenza lingua.
 *
 * Il cookie "lang" (it/en) viene letto dal Worker sulla root "/" per
 * rispettare la scelta dell'utente nelle visite successive.
 *
 * Due comportamenti:
 * 1. A ogni caricamento pagina, salva la lingua della pagina corrente.
 * 2. Quando l'utente clicca lo switch lingua, aggiorna SUBITO il cookie
 *    alla lingua di destinazione, PRIMA che la navigazione parta. Senza
 *    questo, tornando sulla home il Worker rileggerebbe la vecchia
 *    preferenza e rimanderebbe l'utente alla lingua precedente.
 *
 * Cookie tecnico: nessuna profilazione, nessun tracciamento.
 * Durata: 1 anno. SameSite=Lax.
 */
(function () {
  var ONE_YEAR = 60 * 60 * 24 * 365;

  function setLang(lang) {
    if (lang !== "it" && lang !== "en") return;
    document.cookie = "lang=" + lang + ";path=/;max-age=" + ONE_YEAR + ";SameSite=Lax";
  }

  // 1. Salva la lingua della pagina corrente
  var pageLang = document.documentElement.getAttribute("lang");
  setLang(pageLang);

  // 2. Intercetta i click sullo switch lingua per aggiornare il cookie
  //    prima della navigazione. Lo switch è dentro <li class="lang-switch">.
  document.addEventListener("click", function (e) {
    var link = e.target.closest(".lang-switch a[hreflang]");
    if (!link) return;
    var targetLang = link.getAttribute("hreflang");
    setLang(targetLang);
    // La navigazione prosegue normalmente: il cookie è già aggiornato.
  });
})();
