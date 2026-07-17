# De Plantenmakelaars — website

De volledige website als losse bestanden. Statische site (HTML/CSS/JS), dus gratis te hosten.
Publiceren doen we in het begin via **GitHub Pages**.

Live-adres straks: **demo.deplantenmakelaars.nl**

---

## Wat staat er in deze map?

- De pagina's: `index.html`, `over-ons.html`, `diensten.html`, `onze-kwekers.html`, `kweker.html`, `contact.html`, `galerij.html`
- `styles.css` — de vormgeving
- `script.js` — de werking (taalknop, menu, galerij)
- `images/` — alle foto's en logo's
- `data/` — plek voor het Floriday-aanbod per kweker (later)
- `CNAME` — hierin staat het domein `demo.deplantenmakelaars.nl` (niet weghalen)

---

## Eenmalig instellen (ongeveer 20 minuten)

### 1. Accounts en programma
1. Maak een gratis account op **github.com**.
2. Download en installeer **GitHub Desktop** (desktop.github.com). Log daarin in met je GitHub-account.

### 2. De site in GitHub zetten
1. Open GitHub Desktop → **File → Add local repository** → kies deze map (`deplantenmakelaars-site`).
2. Hij vraagt "create a repository" → klik dat aan.
3. Naam bijvoorbeeld: `deplantenmakelaars-site`. Klik **Create repository**.
4. Klik rechtsboven op **Publish repository**.
   - Vink desgewenst "Keep this code private" UIT (voor GitHub Pages gratis moet de repo openbaar zijn).
   - Klik **Publish**.

### 3. GitHub Pages aanzetten
1. Ga op github.com naar je nieuwe repository.
2. **Settings → Pages**.
3. Bij "Branch" kies je `main` en map `/ (root)` → **Save**.
4. Na een paar minuten staat de site live op `https://JOUW-GEBRUIKERSNAAM.github.io/deplantenmakelaars-site/`.

### 4. Eigen domein koppelen (demo.deplantenmakelaars.nl)
1. In **Settings → Pages → Custom domain** typ je: `demo.deplantenmakelaars.nl` → **Save**.
2. Log in bij **TransIP** → domein `deplantenmakelaars.nl` → **DNS-instellingen**.
3. Voeg een record toe:
   ```
   Type:  CNAME
   Naam:  demo
   Waarde: JOUW-GEBRUIKERSNAAM.github.io
   TTL:   1 uur
   ```
4. Wacht 10 minuten tot een paar uur. Daarna staat de site op **demo.deplantenmakelaars.nl** met automatisch een gratis HTTPS-slotje (vinkje "Enforce HTTPS" aanzetten in Settings → Pages zodra dat kan).

---

## Een wijziging live zetten (elke keer)

1. De bestanden in deze map zijn aangepast.
2. Open **GitHub Desktop**. Je ziet links de wijzigingen staan.
3. Typ onderin een kort briefje ("Summary"), bijv. *"tekst homepage aangepast"*.
4. Klik **Commit to main**.
5. Klik rechtsboven **Push origin**.
6. Binnen ~1 minuut staat het live op demo.deplantenmakelaars.nl.

Dat is alles. Aanpassen → Commit → Push → live.

---

## Later: Floriday-aanbod koppelen

GitHub Pages kan alleen "platte" bestanden tonen. Voor het echte, live Floriday-aanbod
per kweker is een klein stukje servercode nodig dat je API-sleutels veilig ophaalt.
Dat kan GitHub Pages niet, maar **Netlify** of **Cloudflare Pages** wel (ook gratis).

Op dat moment koppel je diezelfde GitHub-repo aan Netlify en verplaats je het domein
daarheen. Dat is ongeveer tien minuten werk — de bestanden hoeven niet mee te verhuizen.
Tot die tijd tonen de kwekerpagina's voorbeeldvakjes.
