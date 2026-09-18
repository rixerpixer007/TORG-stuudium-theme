# Sinu Stuudiumi README visuaalid

Staatus: päisebänner, allalaadimisnupud, adaptiivne cross-device seeria ja viie teema galerii on valmis

See dokument on Sinu Stuudiumi README visuaalide kehtiv tootmisspetsifikatsioon. LibreTube'i README-d kasutati ainult hierarhia, rütmi ja varade eesmärgi referentsina. Kõik Sinu Stuudiumi kompositsioonid, tekstid, värvid ja paigutused on originaalsed.

## Varad

| ID      | Fail                                                          | Sisu                                                 | Mõõt        | Maht      |
| ------- | ------------------------------------------------------------- | ---------------------------------------------------- | ----------- | --------- |
| VIS-01  | `assets/readme/github-banner.webp`                            | README päisebänner                                   | 3240 × 1080 | 104 434 B |
| VIS-02A | `assets/readme/download-github.png`                           | GitHub Releasesi allalaadimisnupp                    | 646 × 250   | 16 470 B  |
| VIS-02B | `assets/readme/download-google-play.png`                      | Google Play allalaadimisnupp tulevase poeviite jaoks | 646 × 250   | 16 279 B  |
| VIS-02C | `assets/readme/download-chrome-web-store.png`                 | Chrome Web Store'i nupp tulevase poeviite jaoks      | 646 × 250   | 15 975 B  |
| VIS-02D | `assets/readme/download-app-store.png`                        | App Store'i nupp tulevase poeviite jaoks             | 646 × 250   | 16 016 B  |
| VIS-02E | `assets/readme/download-safari-extension.png`                 | Safari laienduse nupp tulevase poeviite jaoks        | 646 × 250   | 20 318 B  |
| VIS-06  | `assets/readme/screenshots/cross-device-home-wide.webp`       | Põhivaade arvutis ja telefonis, lai variant          | 1920 × 1080 | 162 832 B |
| VIS-07  | `assets/readme/screenshots/cross-device-home-narrow.webp`     | Põhivaade arvutis ja telefonis, kitsas variant       | 1080 × 1520 | 118 160 B |
| VIS-08  | `assets/readme/screenshots/cross-device-settings-wide.webp`   | Seaded arvutis ja telefonis, lai variant             | 1920 × 1080 | 82 190 B  |
| VIS-09  | `assets/readme/screenshots/cross-device-settings-narrow.webp` | Seaded arvutis ja telefonis, kitsas variant          | 1080 × 1520 | 65 864 B  |
| VIS-10  | `assets/readme/gallery/graphite-mint.webp`                    | Grafiit ja münt galerii kaart                        | 1920 × 1200 | 113 860 B |
| VIS-11  | `assets/readme/gallery/graphite-blue.webp`                    | Grafiit ja sinine galerii kaart                      | 1920 × 1200 | 110 294 B |
| VIS-12  | `assets/readme/gallery/obsidian-red.webp`                     | Obsidiaan ja punane galerii kaart                    | 1920 × 1200 | 111 830 B |
| VIS-13  | `assets/readme/gallery/velvet-mauve.webp`                     | Samet ja lillakas galerii kaart                      | 1920 × 1200 | 118 564 B |
| VIS-14  | `assets/readme/gallery/midnight-amber.webp`                   | Kesköö ja merevaik galerii kaart                     | 1920 × 1200 | 124 698 B |

Kõik failid on sRGB-värviruumis ja ilma EXIF- või XMP-metaandmeteta. Kinnitatud cross-device seeria kasutab stabiilseid failinimesid. Galerii viis pilti asuvad juurkausta `SCREEN_SHOT.md` lehel ning iga pilt avaneb sealt täissuuruses.

VIS-02B kuni VIS-02E hoitakse valmis tulevaste ametlike poelehtede jaoks. Neid ei lisata README-sse ega lingita enne, kui vastav Sinu Stuudiumi avalik poeleht on päriselt olemas. README kasutab praegu ainult VIS-02A nuppu ja GitHub Releasesi linki.

## README kompositsioon

README kasutab varasid järgmises järjestuses:

1. VIS-01 kuvatakse lehe ülaosas täislaiuses.
2. VIS-02A kuvatakse installimise jaotises ning viib GitHub Releasesi lehele.
3. Esimene täislaiuses `<picture>` kuvab põhivaate: üle 600 px laiuses VIS-06 ja kuni 600 px laiuses VIS-07.
4. Teine täislaiuses `<picture>` kuvab kujunduse valimise: üle 600 px laiuses VIS-08 ja kuni 600 px laiuses VIS-09.
5. Ekraanipiltide jaotise lõpus viib link `SCREEN_SHOT.md` galeriisse, kus VIS-10 kuni VIS-14 paiknevad ühtses üheveerulises fotoseinas.

Mõlemad nähtavad kaardid renderduvad alati sama laiusega. See hoiab pealkirjad, raamid, varjud ja visuaalse kaalu võrdsena. Laias variandis asuvad arvuti- ja telefonikuva kõrvuti ning on täpselt sama kõrged; kitsas variandis on need sama kõrged, kuid vertikaalselt järjestatud.

## Päris kasutajaliidese lähtepildid

Lõppkompositsioonides kasutati kaheksat kasutaja antud sanitaarset kuvatõmmist:

| Lähtepilt             | Algmõõt     | Kasutus                |
| --------------------- | ----------- | ---------------------- |
| `Green.png`           | 2937 × 1676 | Töölaua põhivaade      |
| `DesktopSettings.png` | 2938 × 1677 | Töölaua seadete vaade  |
| `PhoneMainPage.png`   | 715 × 1305  | Telefoni põhivaade     |
| `PhoneSettings.png`   | 714 × 1305  | Telefoni seadete vaade |
| `Blue.png`            | 2934 × 1681 | Grafiit ja sinine      |
| `Red.png`             | 2937 × 1677 | Obsidiaan ja punane    |
| `Purple.png`          | 2935 × 1679 | Samet ja lillakas      |
| `Amber.png`           | 2932 × 1680 | Kesköö ja merevaik     |

Kuvatõmmiseid vähendati proportsionaalselt. Cross-device piltidel neid ei kallutatud, perspektiivmoonutatud, sisuliselt kärbitud, üle joonistatud ega pildigeneraatoriga muudetud. Galerii ühtse geomeetria jaoks kasutati vaid mõne piksli suurust keskset servakärbet.

## Privaatsuse ja tõepärasuse piirangud

- Kasuta ainult sanitaarset demonstratsioonivaadet.
- Pildil ei tohi olla päris õpilase nime, hinnet, puudumist, sõnumit, tunniplaani, klassikaaslast, kasutajanime, e-posti aadressi, autentimisandmeid ega süsteemiteavitust.
- Ära muuda päris Stuudiumi andmeid üksnes pildi tegemiseks.
- Ära genereeri väljamõeldud Stuudiumi kasutajaliidest ega paranda päris kuvatõmmise tekste generatiivse mudeliga.
- Ära lisa ametlikku Stuudiumi või TORGi logo.
- Ära näita funktsiooni ega platvormi, mis pole pildi tegemise hetkel tegelikult olemas.

## Lukustatud visuaalsüsteem

### Värvid

- Põhitaust: `#0f1311`
- Pind: `#171c19`
- Tugevam pind: `#202824`
- Põhitekst: `#f2f0e9`
- Teisene tekst: `#c1c0b8`
- Piirjoon: `#3a4740`
- Graphite Minti aktsent: `#65d6b1`

### Taust

Kõigi tootekaartide põhigradient G1 on:

```css
linear-gradient(
  135deg,
  #0f1311 0%,
  #171c19 58%,
  #23483b 100%
)
```

Selle peale kasutatakse üht Graphite Minti radiaalset helki:

```css
radial-gradient(
  circle at 78% 18%,
  rgb(101 214 177 / 18%) 0%,
  transparent 52%
)
```

Muid gradiente, dekoratiivseid objekte, tekstuure ega vesimärke tootekaartidele ei lisata.

### Tüpograafia

- Fondipere: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Laia tootekaardi pealkiri: 700, 72 px, `#f2f0e9`
- Kitsa tootekaardi pealkiri: 700, 64 px, `#f2f0e9`
- Pealkiri on horisontaalselt keskel.
- Tekst renderdatakse deterministlikult.

Uue tooteseeria tekstid on täpselt:

- VIS-06 ja VIS-07: `Tuttav Stuudium, uus ilme`
- VIS-08 ja VIS-09: `Vali oma kujundus`

### Laia cross-device kaardi geomeetria

- Lõuend: 1920 × 1080 px
- Pealkirja ülaserv: y = 100 px
- Mõlema kuvatõmmise ülaserv: y = 252 px
- Mõlema kuvatõmmise kõrgus: 672 px
- Töölauakuva vasak serv: x = 155–156 px
- Töölauakuva laius: 1177–1178 px
- Telefonikuva vasak serv: x = 1397 px
- Telefonikuva laius: 368 px
- Kuvade vahe: 64 px
- Raam: 4 px `#3a4740`
- Nurga raadius: töölaual 24 px, telefonil 36 px
- Vari: `0 32px 80px rgb(0 0 0 / 32%)`

### Kitsa cross-device kaardi geomeetria

- Lõuend: 1080 × 1520 px
- Pealkirja ülaserv: y = 124 px
- Töölauakuva mõõt: 904 × 516 px, x = 88 px, y = 250 px
- Telefonikuva kõrgus: 516 px, x = 399 px, y = 820 px
- Telefonikuva laius: põhivaates 283 px, seadetes 282 px
- Raam: 4 px `#3a4740`
- Nurga raadius: töölaual 24 px, telefonil 36 px
- Vari: `0 32px 80px rgb(0 0 0 / 32%)`

Kõik oluline sisu jääb lõuendi 8% turvaala sisse.

### Teemagalerii

VIS-10 kuni VIS-14 kasutavad sama 1920 × 1200 px lõuendit. Iga päris töölauakuva on 1536 × 878 px ning paikneb täpselt keskel: x = 192 px ja y = 161 px. Nurga raadius on 24 px, raam 4 px vastava teema tugeva piirjoone värvi ning vari `0 32px 80px rgb(0 0 0 / 32%)`. Kaartidel ei ole pealkirja ega muud lisateksti.

Kõigi kaartide põhigradient on 135°, peatustega 0%, 58% ja 100%. Selle peal on vastava teema aktsendiga 18% läbipaistmatu radiaalne helk asukohas 78% 18%, mis hajub läbipaistvaks 52% juures.

| Teema               | 0%        | 58%       | 100%      | Helk      | Raam      |
| ------------------- | --------- | --------- | --------- | --------- | --------- |
| Grafiit ja münt     | `#0f1311` | `#171c19` | `#23483b` | `#65d6b1` | `#3a4740` |
| Grafiit ja sinine   | `#0c1118` | `#151c26` | `#1c2f50` | `#75a7ff` | `#3a4b62` |
| Obsidiaan ja punane | `#0d0d0f` | `#18171a` | `#3f1c24` | `#ff6b7a` | `#4b434b` |
| Samet ja lillakas   | `#11111b` | `#181825` | `#34274a` | `#cba6f7` | `#585b70` |
| Kesköö ja merevaik  | `#11100d` | `#1b1914` | `#463618` | `#f2b84b` | `#514735` |

## Päisebänner

VIS-01 on originaalne 3 : 1 kompositsioon, mis kasutab muutmata faili `assets/brand/sinu-stuudium-mark.png` ning tekste `Sinu Stuudium` ja `Stuudium sinu moodi.`. Bänneril ei ole aktsendi- ega gradientjoont, kuvatõmmiseid, seadmemakette, ametlikku Stuudiumi või TORGi brändingut ega vesimärki.

## Allalaadimisnupud

Kõik viis nuppu kasutavad sama mõõtu, sisemist rütmi ja tumedat Sinu Stuudiumi stiili. Platvormi märgid säilitavad oma tavapärase kuju ja värvikäsitluse; nende ümber ei lisata valget taustaplaati ega pöörata märgi värve ümber.

Nupud on navigeerimisvarad, mitte väide, et rakendus on igas poes juba saadaval. VIS-02B kuni VIS-02E aktiveeritakse alles vastava ametliku poe-URL-i olemasolul.

## Alt-tekstid

| Vara               | Alt-tekst                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| VIS-01             | `Sinu Stuudium – Stuudium sinu moodi.`                                     |
| VIS-02A            | `Laadi Sinu Stuudium GitHubist alla`                                       |
| VIS-06 ja VIS-07   | `Sinu Stuudiumi põhivaade arvutis ja telefonis Graphite Minti kujundusega` |
| VIS-08 ja VIS-09   | `Sinu Stuudiumi kujunduse valimine arvutis ja telefonis`                   |
| VIS-10 kuni VIS-14 | `Sinu Stuudiumi põhivaade kujundusega „[teema nimi]”`                      |

Pilt ei tohi olla ainus koht, kus oluline teave esineb. Installimine, saadavus, omadused ja privaatsus peavad jääma README-s ka tavatekstina arusaadavaks.

## Kvaliteedikontroll

Enne lõppvarade kasutamist kontrolliti:

- täpsed pikslimõõdud ja kuvasuhted;
- sRGB-värviprofiil;
- faili mahupiir;
- teksti kirjapilt ja joondus;
- päris kasutajaliidese proportsioonid;
- 8% turvaala;
- loetavus README tegeliku kuvamislaiuse juures;
- EXIF- ja XMP-metaandmete puudumine;
- isikuandmete, lisateksti ja vesimärkide puudumine.

README tootepilte ei venitata Chrome Web Store'i ega teiste poodide nõutud mõõtudesse. Poe ekraanipildid ja reklaampildid koostatakse hiljem eraldi, kasutades samu sanitaarseid lähtekuvatõmmiseid.
