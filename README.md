# 🎿 Alpska šola — finalni paket

## ✅ Kaj je v paketu

- **Naslovna stran** + 10 podstrani
- **Prijavni obrazec** (`/prijava`) — bere programe iz baze
- **CRM** (`/admin`) — dashboard, prijavnice, programi, uporabniki
- **API** za vse funkcionalnosti
- **Avtentikacija**

## 🚀 Deploy

### 1. GitHub
- Zbriši stari `alpska-sola` repo
- Naredi novega: `github.com/new`
- Naloži vsebino tega ZIP-a (drag & drop)

### 2. Vercel
- Import projekt iz GitHub-a
- Deploy

### 3. Environment Variables (Vercel Settings → Environment Variables)
```
JWT_SECRET=tvoj-dolg-nakljucni-niz
SETUP_KEY=alpska-2026-tajna-xyz
```
+ vse `POSTGRES_*` od Neon (avtomatsko)

### 4. Baza (Neon SQL Editor)

Zaženi:
```sql
CREATE TABLE IF NOT EXISTS programi (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  naziv VARCHAR(200) NOT NULL,
  opis TEXT,
  aktiven BOOLEAN DEFAULT true,
  cena_od INTEGER,
  ustvarjeno TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prijave (
  id SERIAL PRIMARY KEY,
  program VARCHAR(100) NOT NULL,
  otrok_ime VARCHAR(100) NOT NULL,
  otrok_priimek VARCHAR(100) NOT NULL,
  otrok_rojstvo DATE NOT NULL,
  otrok_znanje VARCHAR(50),
  starsi_ime VARCHAR(100) NOT NULL,
  starsi_priimek VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefon VARCHAR(50) NOT NULL,
  naslov VARCHAR(300),
  posta VARCHAR(100),
  opomba TEXT,
  status VARCHAR(50) DEFAULT 'nova',
  termin VARCHAR(200),
  cena INTEGER,
  ustvarjeno TIMESTAMP DEFAULT NOW(),
  posodobljeno TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admini (
  id SERIAL PRIMARY KEY,
  email VARCHAR(200) UNIQUE NOT NULL,
  ime VARCHAR(100) NOT NULL,
  geslo_hash VARCHAR(500) NOT NULL,
  vloga VARCHAR(50) DEFAULT 'admin',
  ustvarjeno TIMESTAMP DEFAULT NOW()
);

INSERT INTO programi (slug, naziv, aktiven) VALUES
  ('sola-smucanja', 'Tečaji smučanja in bordanja', true),
  ('ski-racing-team', 'Tekmovalne ekipe', true),
  ('smucarska-akademija', 'Smučarska akademija', true),
  ('plavalni-tecaj', 'Tečaj plavanja', true),
  ('sportna-abeceda', 'Športna abeceda', true),
  ('sola-rolanja', 'Tečaj rolanja', true),
  ('praznovanje-rojstnega-dne', 'Rojstni dan z Alpsko šolo', true),
  ('servis', 'Servis smuči', true),
  ('izposoja-opreme', 'Izposoja opreme', true)
ON CONFLICT (slug) DO NOTHING;

-- Admin (geslo: Prosenak2000)
INSERT INTO admini (email, ime, geslo_hash) VALUES (
  'info@alpskasola.com',
  'Admin',
  '$2b$10$Ul8xK/6dIyrj6PXp.ZuzQOHYk6piQRFlCakE8.n3xZWZH.bkiMpNC'
) ON CONFLICT (email) DO NOTHING;
```

### 5. Prijavi se

URL: `https://tvoja-domena.vercel.app/admin/login`
- Email: `info@alpskasola.com`
- Geslo: `Prosenak2000`

## 📋 CRM struktura

- `/admin` — Dashboard
- `/admin/prijave` — Vse prijavnice + filtri
- `/admin/prijave/nova` — Dodaj ročno
- `/admin/programi` — Upravljanje programov (dodaj/uredi/skrij)
- `/admin/admini` — Seznam uporabnikov

## 🎯 Programi v CMS

Iz CRM-ja lahko:
- Dodaš nov program
- Urediš obstoječi (cena, opis)
- Skriješ program (avtomatsko izgine iz prijavnega obrazca)
- Izbrišeš program

Vse spremembe so v živo!
