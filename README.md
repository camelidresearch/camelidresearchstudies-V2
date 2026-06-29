# Camelid Research Studies APS — sito

Sito statico multipagina costruito con **Eleventy (11ty)**, pensato per essere pubblicato su **GitHub + Cloudflare Pages**.

## Requisiti

- Node.js 20 o superiore

## Sviluppo in locale

```bash
npm install        # installa Eleventy
npm start          # avvia il server di sviluppo su http://localhost:8080
npm run build      # genera il sito statico nella cartella _site/
```

## Struttura

```
src/
  _data/
    site.json        → nome, menu, email, social, token analytics  (dati globali)
    aree.json        → le 8 aree di attività       (usate in Home e Progetti)
    progetti.json    → i progetti 2026–2027         (usati in Home e Progetti)
    valori.json      → l'elenco dei valori
  _includes/
    base.njk         → struttura HTML comune (head, nav, footer, analytics)
    partials/        → nav.njk, footer.njk
  assets/
    css/style.css    → tutto il design system (colori, tipografia, componenti)
    img/             → logo e immagini
  *.njk              → una pagina ciascuno; il testo sta nel "front matter" in cima
_site/               → output generato (NON va versionato, è in .gitignore)
```

## Dove si modificano i contenuti

I testi sono **separati dalla grafica**, così la cliente potrà modificarli senza toccare il codice:

- **Menu, email, social, dominio** → `src/_data/site.json`
- **Aree di attività, progetti, valori** → i rispettivi file in `src/_data/`
- **Testo di una pagina** → il blocco `---` in cima al file `src/<pagina>.njk`
- **Immagini** → `src/assets/img/` (poi si referenzia il file nella pagina)

## Deploy su Cloudflare Workers

Il sito è pubblicato come Worker con asset statici (Cloudflare ha unificato Pages dentro Workers).

1. Push del repository su GitHub.
2. Cloudflare → **Workers & Pages → Create**, importa il repo dalla Git.
3. Impostazioni di build:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
   - **Path / root directory:** vuoto
   - **Environment variable:** `NODE_VERSION = 20`
4. La configurazione è in `wrangler.jsonc` alla radice: `assets.directory = "./_site"` e il campo `name` deve coincidere con il nome del progetto nella dashboard.

## Form di contatto (Web3Forms)

Il modulo in `/contatti/` invia i dati a Web3Forms (le Pages Forms non funzionano sui Worker).
Nel form c'è un campo nascosto `access_key` con la chiave dell'associazione e un honeypot anti-spam. Le risposte arrivano via email all'indirizzo collegato alla chiave; non serve alcun backend.


## Statistiche (Cloudflare Web Analytics)

1. Cloudflare → **Web Analytics**, aggiungi il sito e copia il *token*.
2. Incollalo in `src/_data/site.json` alla voce `cloudflareAnalyticsToken`.
   Se il campo è vuoto lo script non viene caricato. Niente cookie, niente banner aggiuntivi.

## Privacy Policy

`/privacy-policy/` è una **bozza tecnica segnaposto**: va rivista e completata con un
riferimento legale prima della pubblicazione.

## Passo successivo: editing dei testi via pannello (CMS)

L'architettura è già pronta: i contenuti vivono in `_data/` e nei front matter.
Per dare alla cliente un pannello di modifica senza toccare il codice basterà agganciare
un CMS Git-based — consigliato **Sveltia CMS** (o **Decap CMS**), entrambi compatibili con
un sito statico. Si aggiunge una cartella `admin/` con un file di configurazione che mappa
i campi già esistenti; ogni salvataggio diventa un commit. Nessuna riscrittura del sito.

## Da completare (contenuti da fornire)

- Board: nomi, ruoli, brevi bio ed eventuali foto
- Partner: loghi e nomi
- Risorse / Pubblicazioni: materiali reali quando disponibili
- Parlano di noi: rassegna stampa
- Foto reali (alpaca, attività, sede) — il layout è predisposto per molte immagini
- URL reali dei profili social
