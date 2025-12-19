## Prerequisites

- Node.js (version 24 or higher)
- pnpm (version 10 or higher)

## Tech Stack

Dette monorepoet bruker:

- **Turborepo** + **pnpm workspaces** for monorepo-håndtering
- **React** for UI-komponenter
- **Next.js** for arena-web
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
   pnpm dev
   ```

## Oppgave

Undersøk API'et og frontend-applikasjonen i dette monorepoet. Gjør nødvendige endringer for å fjerne legacy-kode og forbedre brukeropplevelsen i arena-web applikasjonen.

**Merk**: Fokuset er primært på **arena-web** og den omliggende strukturen. API'et er forenklet og inneholder kun pasient- og timebestilling-endepunkter.

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

#### Kodekvalitet

- Er det noen åpenbare problemer med koden?
- Hvordan håndteres tilstand og data-fetching?
- Er det noen anti-patterns eller legacy-mønstre?

#### Konfigurasjon

- Hvordan er prosjektet konfigurert?
- Er alle konfigurasjonsfilene nødvendige?
- Hvordan håndteres miljøvariabler?

#### Bygging av pakker

- Hva er fordeler og ulemper ved den valgte byggeprosessen?
- Hvordan deles konfigurasjon på tvers av pakkene?
