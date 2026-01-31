# EduCycle React - Web Aplikacija za Školsko Zvono 🎓

Moderna web aplikacija za praćenje rasporeda časova i automatsko aktiviranje školskog zvona, kreirana sa React, TypeScript i Vite.

## ✨ Karakteristike

- 🎨 **Moderan glassmorphism dizajn** sa Framer Motion animacijama
- ⏰ **Real-time prikaz** trenutnog i sledećeg časa
- 🔔 **Web Serial API** za kontrolu školskog zvona (Chrome/Edge)
- 🔥 **Firebase Realtime Database** za sinhronizaciju rasporeda
- 📱 **Responsive dizajn** - radi na svim uređajima
- 🎬 **Video pozadina** sa particle efektima
- 🌐 **100% Web aplikacija** - ne zahteva instalaciju

## 🚀 Pokretanje

```bash
# Instaliraj zavisnosti
npm install

# Pokreni development server
npm run dev

# Build za produkciju
npm run build
```

Aplikacija će biti dostupna na: http://localhost:5173

## 🔔 Web Serial API za Zvono

### Podrška browsera:
- ✅ Google Chrome
- ✅ Microsoft Edge
- ❌ Firefox (ne podržava Web Serial API)
- ❌ Safari (ne podržava Web Serial API)

### Kako povezati zvono:
1. Otvorite aplikaciju u Chrome ili Edge browseru
2. Kada dođe vreme za zvono, pojaviće se prompt
3. Izaberite COM port vašeg uređaja
4. Kliknite "Connect"

## 📁 Struktura Projekta

```
edu-cycle-react/
├── public/
│   ├── assets/           # Logo, video, ikone
│   └── schedule.json     # Lokalni raspored (fallback)
├── src/
│   ├── components/       # React komponente
│   │   ├── Clock.tsx
│   │   ├── SchoolHeader.tsx
│   │   ├── ClassInfo.tsx
│   │   ├── WindowControls.tsx
│   │   └── ParticleBackground.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useSchedule.ts
│   │   ├── useBellSystem.ts
│   │   └── useWebSerial.ts
│   ├── firebase-config.ts
│   ├── App.tsx
│   ├── App.css          # Glassmorphism stilovi
│   └── main.tsx
```

## 🔥 Firebase Konfiguracija

Aplikacija koristi Firebase Realtime Database za sinhronizaciju rasporeda.
Konfiguracija se nalazi u `src/firebase-config.ts`.

### Struktura rasporeda u Firebase:
```json
{
  "schedule": {
    "firstShift": [
      {
        "class": "1. čas",
        "start": "07:00",
        "end": "07:45"
      }
    ],
    "secondShift": [...]
  }
}
```

## 🎨 Tehnologije

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animacije
- **Firebase** - Realtime database
- **Lucide React** - Ikone
- **Web Serial API** - Komunikacija sa hardverom

## 📱 Progressive Web App

Aplikacija može da se instalira kao PWA:
1. Otvorite u Chrome/Edge
2. Kliknite na ikonu "Install" u address baru
3. Aplikacija će se instalirati na desktop

## 🌐 Deployment

Za deployment na web hosting:

```bash
# Build aplikaciju
npm run build

# Upload sadržaj 'dist' foldera na hosting
```

Preporučeni hosting servisi:
- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages

## 📝 Napomene

- Aplikacija je potpuno nezavisna od Electron verzije
- Svi assets su u `public/assets` folderu
- Video pozadina je opciona (može se ukloniti iz App.tsx)
- Za promenu rasporeda, ažurirajte Firebase ili `public/schedule.json`

## 🤝 Kontakt

Za pitanja i sugestije, kontaktirajte tim za razvoj.

---
Razvijeno sa ❤️ za Ugostiteljsko turističku školu Novi Pazar  