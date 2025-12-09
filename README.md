## Prerequisites

- Node.js (version 24 or higher)
- pnpm (version 10 or higher)

## Tech Stack

Dette monorepoet bruker:

- **Turborepo** + **pnpm workspaces** for monorepo-håndtering
- **React** (v18 og v19) for UI-komponenter
- **Next.js** for arena-web
- **Vite** for admin-applikasjonen
- **Express** for API
- **TypeScript** på tvers av alle pakker
- **Jest** for testing

## Kom i gang

1. Installer avhengigheter:

   ```bash
   pnpm install
   ```

2. Start utviklingsservere:

   ```bash
   # Start alle applikasjoner i utviklingsmodus
   pnpm dev
   ```

## Oppgave

Undersøk API'et og frontend-applikasjonene i dette monorepoet. Gjør nødvendige endringer for å fjerne legacy-kode og forbedre brukeropplevelsen i admin-applikasjonen og arena-web applikasjonen.

**Merk**: Fokuset er primært på **arena-web** og den omliggende strukturen. API'et har flere endepunkter enn nødvendig for fleksibilitet - det er ikke forventet at du bruker alle. Velg det som gir mening for løsningen din.

### Rammer

- **Tidsbruk**: Maksimalt 4 timer (men mindre er helt akseptabelt)
- **Fokus**: Det viktige er **ikke** hva du ender opp med, men:
  - **Hvordan** du tenker og tilnærmingen din
  - **Hvilke** valg du tar og prioriteringer du gjør
  - **Hvorfor** du velger bestemte løsninger

### Krav

- **Dokumentasjon**: Dokumenter tankeprosessen din underveis, enten:
  - Direkte i koden (kommentarer)
  - I en egen fil (f.eks. `REFLEKSJONER.md`)
  - Eller begge deler
- **Refleksjon**: Beskriv avveininger, utfordringer og eventuelle kompromisser
- **Eksterne pakker**: Du kan fritt bruke eksterne pakker, men:
  - Begrunn valget grundig
  - Forklar hvorfor pakken løser problemet bedre enn egenutviklet kode
  - Vurder påvirkningen på bundle-størrelse og vedlikehold

### Eksempler på tema som er verdt å tenke rundt

#### Pakkeversjoner

- Hvordan håndteres pakkeversjoner i dette monorepoet?
- Har bruken av både React 18 og React 19 betydning for systemet?

#### Bygging av pakker

- Hva er fordeler og ulemper ved at alle pakker må bygges?
- Hvordan skalerer denne tilnærmingen når antall pakker øker?

#### Deling av konfigurasjon

- Hvordan bør ESLint, Prettier, Babel og Webpack-konfigurasjoner deles på tvers av pakkene?
