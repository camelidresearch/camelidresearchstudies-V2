/**
 * Camelid Research Studies — Worker per il detect della lingua del browser.
 *
 * Comportamento:
 * - Interviene SOLO sulla root "/" (configurato via run_worker_first in wrangler.jsonc).
 * - Se esiste il cookie "lang", rispetta la scelta dell'utente:
 *     lang=en  -> redirect 302 a /en/
 *     lang=it  -> serve la home italiana (nessun redirect)
 * - Se il cookie non c'è, legge l'header Accept-Language:
 *     browser che preferisce l'inglese -> redirect 302 a /en/
 *     altrimenti (italiano o qualsiasi altra lingua) -> home italiana
 * - Il cookie viene scritto dallo switch lingua lato client (vedi lang-cookie.js),
 *   non dal Worker: così la scelta manuale su qualsiasi pagina viene ricordata.
 *
 * Tutto il resto del sito (ogni pagina diversa da "/") è servito come asset
 * statico senza passare da qui.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Sicurezza: interveniamo solo sulla root esatta.
    // (run_worker_first è già limitato a "/", questo è un doppio controllo)
    if (url.pathname !== "/") {
      return env.ASSETS.fetch(request);
    }

    // 1. Cookie di preferenza esplicita: vince sempre
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)lang=(it|en)/);
    if (match) {
      if (match[1] === "en") {
        return noCacheRedirect(url.origin + "/en/");
      }
      // lang=it -> home italiana (no-cache, così i reload rileggono il cookie)
      return serveItalianHome(request, env);
    }

    // 2. Nessun cookie: leggi la lingua preferita del browser
    const accept = (request.headers.get("Accept-Language") || "").toLowerCase();
    const prefersEnglish = detectEnglish(accept);

    if (prefersEnglish) {
      return noCacheRedirect(url.origin + "/en/");
    }

    // 3. Default: home italiana
    return serveItalianHome(request, env);
  }
};

/**
 * Serve la home italiana dagli asset statici, ma con header che impediscono
 * al browser di riusare una risposta in cache saltando il Worker.
 * Senza questo, dopo un reload lo switch lingua potrebbe non reagire.
 */
async function serveItalianHome(request, env) {
  const assetResponse = await env.ASSETS.fetch(request);
  const response = new Response(assetResponse.body, assetResponse);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Vary", "Cookie, Accept-Language");
  return response;
}

/**
 * Redirect 302 che il browser NON deve mettere in cache.
 * Senza questi header, il browser memorizza il redirect e non interroga
 * più il Worker: il cookie di preferenza verrebbe ignorato ai reload.
 */
function noCacheRedirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": location,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Vary": "Cookie, Accept-Language"
    }
  });
}

/**
 * Ritorna true se il browser preferisce l'inglese all'italiano.
 * Analizza l'header Accept-Language rispettando l'ordine di priorità (q-values).
 * In caso di dubbio o parità, l'italiano vince (è la lingua di default del sito).
 */
function detectEnglish(acceptLanguage) {
  if (!acceptLanguage) return false;

  // Esempio header: "en-US,en;q=0.9,it;q=0.8"
  const langs = acceptLanguage
    .split(",")
    .map(part => {
      const [tag, qPart] = part.trim().split(";");
      const q = qPart ? parseFloat(qPart.split("=")[1]) : 1;
      return { tag: tag.trim(), q: isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);

  // Trova la prima lingua che sia chiaramente IT o EN
  for (const { tag } of langs) {
    if (tag.startsWith("it")) return false; // italiano preferito
    if (tag.startsWith("en")) return true;  // inglese preferito
  }

  // Nessuna delle due lingue esplicitamente: default italiano
  return false;
}
