# Firebase Setup - VAŽNO! 🔥

## Problem sa Firebase konekcijom

Greška koju vidite:
```
FIREBASE WARNING: Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly.
```

## REŠENJE

### 1. Proverite Firebase Realtime Database Rules

Idite na [Firebase Console](https://console.firebase.google.com/):
1. Izaberite projekat "edu-cycle"
2. Idite na **Realtime Database**
3. Kliknite na tab **Rules**
4. Postavite ova pravila za READ-ONLY pristup:

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "schedule": {
      ".read": true
    }
  }
}
```

Ili za potpuno otvorena pravila (samo za development):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

5. Kliknite **Publish**

### 2. Proverite da li postoji podatak u bazi

U Firebase Console:
1. Idite na **Realtime Database** > **Data** tab
2. Trebalo bi da vidite strukturu:
```
edu-cycle-default-rtdb
└── schedule
    ├── firstShift
    │   ├── 0
    │   │   ├── class: "1. čas"
    │   │   ├── start: "07:00"
    │   │   └── end: "07:45"
    │   └── ...
    └── secondShift
        └── ...
```

### 3. Ako ne postoje podaci, dodajte ih

Kopirajte sadržaj iz `public/schedule.json` i dodajte u Firebase:
1. Kliknite na `+` pored root node-a
2. Za ime stavite: `schedule`
3. Za vrednost importujte JSON

### 4. Alternativa - Koristite samo lokalni raspored

Ako ne želite Firebase, u `src/hooks/useSchedule.ts` zakomentarišite Firebase deo (linije 53-72).

## Napomena

Aplikacija **RADI I BEZ FIREBASE** - koristi lokalni `public/schedule.json` kao fallback!

Firebase je opcioni i služi za:
- Real-time sinhronizaciju između više uređaja
- Centralizovanu izmenu rasporeda
- Automatsko ažuriranje bez deploy-a

---

**Trenutni status:** Aplikacija koristi lokalni raspored i pokušava Firebase konekciju.