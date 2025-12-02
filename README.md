## Prerequisites

- Node.js (version 24 or higher)
- pnpm (version 10 or higher)

## Oppgave

Undersøk API'et og frontend-applikasjonene i dette monorepoet. Gjør nødvendige endringer for å fjerne legacy-kode og forbedre brukeropplevelsen i admin-applikasjonen og arena-web applikasjonen.

Det viktige er ikke nødvendigvis hva du ender opp med, men hvordan du tenker underveis og hvilke valg du tar. Dokumenter gjerne underveis i koden eller i en egen fil.

### Spesifikke utfordringer

#### Datahåndtering i arena-web
I `apps/arena-web/src/app/page.tsx` finnes det en implementasjon som forsøker å håndtere pasientdata med både lokal cache og polling. Gjør deg tanker og gjør eventuelle endringer om ønskelig for å forbedre datahåndtering, ytelse og brukeropplevelse. Vurder spesielt:

- Synkronisering mellom lokal state og server-data
- Mulige race conditions ved parallelle oppdateringer  
- Strategi for datahenting (polling vs andre tilnærminger)
- Håndtering av stale data i cache

### Diskusjonspunkter

#### Pakkeversjoner

- Hvordan håndteres pakkeversjoner i dette monorepoet?
- Har bruken av både React 18 og React 19 betydning for systemet?

#### Bygging av pakker

- Hva er fordeler og ulemper ved at alle pakker må bygges?
- Hvordan skalerer denne tilnærmingen når antall pakker øker?

#### Deling av konfigurasjon

- Hvordan bør ESLint, Prettier, Babel og Webpack-konfigurasjoner deles på tvers av pakkene?
