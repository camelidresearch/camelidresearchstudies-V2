/**
 * Salva la preferenza lingua in un cookie tecnico quando l'utente
 * naviga il sito o clicca lo switch lingua.
 *
 * Il cookie "lang" (it/en) viene letto dal Worker sulla root "/" per
 * rispettare la scelta dell'utente nelle visite successive.
 *
 * Cookie tecnico: nessuna profilazione, nessun tracciamento.
 * Durata: 1 anno. SameSite=Lax.
 */
(function () {
  var lang = document.documentElement.getAttribute("lang");
  if (lang !== "it" && lang !== "en") return;

  var oneYear = 60 * 60 * 24 * 365;
  document.cookie = "lang=" + lang + ";path=/;max-age=" + oneYear + ";SameSite=Lax";
})();
