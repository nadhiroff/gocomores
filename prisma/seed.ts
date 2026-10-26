/**
 * Données de départ GoComores.
 *
 * Règle éditoriale : seul ce qui a été recoupé avec une source est marqué VERIFIED
 * (ici : Karthala et la vieille ville de Moroni — sources : Wikipedia, Archnet).
 * Coordonnées GPS : OpenStreetMap (Nominatim), relevées le 26/10/2026.
 * Tout le reste est TO_CONFIRM et s'affiche « Information à confirmer ».
 * Le statut de Mayotte est sensible : volontairement NON inclus, en attente de décision.
 *
 * Les photos viennent de Wikimedia Commons (licences libres) : auteurs et licences
 * dans src/lib/photo-credits.ts, affichés sur la page /credits-photos.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Field = { value: string | null; toConfirm: boolean };
type Practical = { access: Field; hours: Field; fares: Field; bestPeriod: Field };

const ok = (value: string): Field => ({ value, toConfirm: false });
const tbc = (value: string | null = null): Field => ({ value, toConfirm: true });

const ISLANDS = [
  { slug: "grande-comore", name: "Grande Comore", localName: "Ngazidja", color: "#003DA5" },
  { slug: "anjouan", name: "Anjouan", localName: "Ndzuwani", color: "#EF3340" },
  { slug: "moheli", name: "Mohéli", localName: "Mwali", color: "#FFD100" },
];

const CATEGORIES = [
  { slug: "histoire", name: "Histoire", icon: "Landmark" },
  { slug: "nature", name: "Nature", icon: "Trees" },
  { slug: "ville", name: "Ville", icon: "Building2" },
  { slug: "culture", name: "Culture", icon: "Palette" },
  { slug: "plage", name: "Plage", icon: "Waves" },
  { slug: "volcan", name: "Volcan", icon: "Flame" },
];

const VERIFIED_AT = new Date("2026-10-10T00:00:00.000Z");

interface SeedPlace {
  slug: string;
  name: string;
  island: string;
  category: string;
  summary: string;
  history: string;
  practical: Practical;
  lat: number;
  lng: number;
  status: "VERIFIED" | "TO_CONFIRM";
  /** La première photo sert de couverture. */
  gallery: { file: string; alt: string }[];
}

const SEED_PLACES: SeedPlace[] = [
  {
    slug: "mont-karthala",
    name: "Mont Karthala",
    island: "grande-comore",
    category: "volcan",
    summary:
      "Point culminant des Comores (2 361 m), le Karthala est un volcan actif dont la vaste caldeira, d'environ 3 × 4 km, se rejoint à pied avec un guide local.",
    history:
      "Le Karthala forme la moitié sud de Ngazidja. Volcan bouclier encore actif, il est entré en éruption plus de vingt fois depuis le XIXe siècle. Les éruptions d'avril 2005 et de mai 2006 ont entraîné l'évacuation d'environ 2 000 habitants et ont agrandi et approfondi la caldeira.\n\nSes pentes boisées abritent une biodiversité remarquable ; elles sont protégées depuis 2010 par le parc national du Karthala, qui couvre environ 262 km². Les forêts restent menacées par l'exploitation du bois et l'extension des cultures.",
    practical: {
      access: tbc("Les ascensions partent des villages situés sur les flancs de la montagne. Se faire accompagner par un guide local est vivement conseillé."),
      hours: tbc("L'ascension se prépare sur une à deux journées selon l'itinéraire choisi."),
      fares: tbc(),
      bestPeriod: tbc("Plutôt en saison sèche, hors période cyclonique (voir Infos voyageurs)."),
    },
    lat: -11.75853,
    lng: 43.36562,
    status: "VERIFIED",
    gallery: [
      { file: "mont-karthala-1", alt: "Vue panoramique de la caldeira du Karthala depuis le bord du cratère" },
      { file: "mont-karthala-2", alt: "La caldeira du Karthala et ses coulées de lave sous un ciel bleu" },
      { file: "mont-karthala-3", alt: "Randonneur sur le sentier de montée vers le cratère du Karthala" },
    ],
  },
  {
    slug: "vieille-ville-moroni-mosquee-vendredi",
    name: "Vieille ville de Moroni et Mosquée du Vendredi",
    island: "grande-comore",
    category: "histoire",
    summary:
      "Au bord du port de Moroni, la médina de pierre et ses ruelles étroites entourent l'ancienne mosquée du Vendredi, construite en 1427 dans le style swahili.",
    history:
      "L'ancienne mosquée du Vendredi, aussi appelée mosquée Badjanani, a été édifiée en 831 de l'hégire, soit 1427. Son minaret a été ajouté vers 1921. Bâtie dans le style swahili, elle se dresse sur le port, à la lisière de la vieille médina.\n\nLe quartier historique est un dédale de ruelles et de maisons anciennes, parfois dégradées faute d'entretien. Son atmosphère rappelle, en plus petit, celle de la vieille ville de Lamu, au Kenya.",
    practical: {
      access: ok("Sur le port de Moroni, à la limite de la médina ; le quartier se parcourt à pied."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc("Tôt le matin ou en fin de journée, pour la fraîcheur et la lumière."),
    },
    lat: -11.70373,
    lng: 43.25157,
    status: "VERIFIED",
    gallery: [
      { file: "vieille-ville-moroni-mosquee-vendredi-1", alt: "La mosquée du Vendredi de Moroni dominant le vieux port et ses barques colorées" },
      { file: "vieille-ville-moroni-mosquee-vendredi-2", alt: "L'ancienne mosquée du Vendredi et le port de Moroni se reflétant dans l'eau" },
      { file: "vieille-ville-moroni-mosquee-vendredi-3", alt: "Ruelle étroite de la médina de Moroni" },
    ],
  },
  {
    slug: "lac-sale",
    name: "Lac Salé",
    island: "grande-comore",
    category: "nature",
    summary:
      "Ancien cratère volcanique rempli d'eau de mer, situé près de Mitsamiouli, dans le nord de Ngazidja.",
    history:
      "Le Lac Salé occupe un cratère éteint que la mer a envahi. Il se trouve à proximité de Mitsamiouli, sur la côte nord de l'île, et fait partie des paysages volcaniques les plus singuliers de Grande Comore. Les détails de son histoire et de son accès restent à documenter.",
    practical: {
      access: tbc("Près de Mitsamiouli, au nord de l'île. Itinéraire exact à confirmer."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -11.37528,
    lng: 43.37299,
    status: "TO_CONFIRM",
    gallery: [
      { file: "lac-sale-1", alt: "Le lac Salé, lac de cratère aux eaux vertes, en bord d'océan" },
      { file: "lac-sale-2", alt: "Ancien cratère volcanique rempli d'eau sur la côte de Grande Comore" },
    ],
  },
  {
    slug: "plages-mitsamiouli",
    name: "Plages de Mitsamiouli",
    island: "grande-comore",
    category: "plage",
    summary:
      "La côte nord de Ngazidja autour de Mitsamiouli, ses plages de sable clair et ses hôtels de bord de mer, dont la plage de Galawa.",
    history:
      "Mitsamiouli est la principale destination balnéaire de Grande Comore, appréciée notamment des voyageurs venus d'Europe. La pêche y reste une activité importante. Les plages du secteur, comme celle de Galawa, sont adossées à des hôtels de bord de mer.",
    practical: {
      access: tbc("Route depuis Moroni vers le nord de l'île. Durée du trajet à confirmer."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -11.38942,
    lng: 43.29027,
    status: "TO_CONFIRM",
    gallery: [
      { file: "plages-mitsamiouli-1", alt: "Chemin de sable sous les cocotiers menant à la plage de Mitsamiouli" },
      { file: "plages-mitsamiouli-2", alt: "Plage de sable blanc de Mitsamiouli bordée de cocotiers" },
      { file: "plages-mitsamiouli-3", alt: "Large plage de sable clair et cocoteraie à Mitsamiouli" },
    ],
  },
  {
    slug: "medina-mutsamudu",
    name: "Médina de Mutsamudu",
    island: "anjouan",
    category: "ville",
    summary:
      "Capitale d'Anjouan, Mutsamudu s'étage autour de son port et de sa médina ; la citadelle domine la ville.",
    history:
      "Mutsamudu est la capitale de Ndzuwani (Anjouan). Sa médina et sa citadelle témoignent du passé des sultanats de l'archipel. Les médinas historiques des Comores font l'objet d'une démarche de reconnaissance au titre du patrimoine mondial (à confirmer).",
    practical: {
      access: tbc("Accessible par l'aéroport d'Anjouan et la route ; liaisons inter-îles à confirmer."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -12.16885,
    lng: 44.39428,
    status: "TO_CONFIRM",
    gallery: [
      { file: "medina-mutsamudu-1", alt: "Les remparts de la citadelle de Mutsamudu face à l'océan" },
      { file: "medina-mutsamudu-2", alt: "La ville et le port de Mutsamudu vus des hauteurs" },
      { file: "medina-mutsamudu-3", alt: "Vue sur Mutsamudu et les montagnes d'Anjouan" },
    ],
  },
  {
    slug: "domoni",
    name: "Domoni",
    island: "anjouan",
    category: "histoire",
    summary:
      "Cité historique de la côte est d'Anjouan, connue pour ses remparts anciens et le mausolée du président Ahmed Abdallah.",
    history:
      "Domoni est l'une des villes les plus importantes d'Anjouan et l'un des anciens centres des sultanats de l'archipel. On y trouve des vestiges d'enceinte et le mausolée du président Ahmed Abdallah. L'histoire détaillée du site reste à vérifier avant publication définitive.",
    practical: {
      access: tbc("Route depuis Mutsamudu. Durée du trajet à confirmer."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -12.25865,
    lng: 44.52885,
    status: "TO_CONFIRM",
    gallery: [
      { file: "domoni-1", alt: "Photographie ancienne de Domoni, vers 1930" },
      { file: "domoni-2", alt: "Ville côtière d'Anjouan et ses minarets au bord de l'océan" },
    ],
  },
  {
    slug: "parc-marin-moheli",
    name: "Parc marin de Mohéli",
    island: "moheli",
    category: "nature",
    summary:
      "Première aire protégée des Comores, créée en 2001 : tortues vertes, baleines à bosse et dauphins dans les eaux de Mwali.",
    history:
      "Le parc marin de Mohéli a été créé le 19 avril 2001, première aire protégée du pays. Il est devenu parc national de Mohéli en 2010, puis a été étendu en 2015. Les tortues vertes viennent y pondre chaque année ; on y observe aussi des tortues imbriquées, des baleines à bosse et plusieurs espèces de dauphins. Le site figure sur la liste indicative du patrimoine mondial de l'UNESCO.",
    practical: {
      access: tbc("Via l'île de Mohéli ; sorties en mer à organiser avec des opérateurs locaux (à confirmer)."),
      hours: tbc(),
      fares: tbc("Droits d'entrée et tarifs des sorties à confirmer."),
      bestPeriod: tbc("Les saisons de ponte et d'observation des baleines sont à confirmer."),
    },
    lat: -12.36924,
    lng: 43.71854,
    status: "TO_CONFIRM",
    gallery: [
      { file: "parc-marin-moheli-1", alt: "Récif corallien préservé au large de Mohéli" },
      { file: "parc-marin-moheli-2", alt: "Les îlots de Nioumachoua vus depuis la plage" },
      { file: "parc-marin-moheli-3", alt: "Panorama sur la mangrove et la baie de Nioumachoua" },
    ],
  },
  {
    slug: "plage-itsamia",
    name: "Plage d'Itsamia",
    island: "moheli",
    category: "plage",
    summary:
      "Plage de Mwali réputée pour l'observation des tortues vertes venues pondre (à confirmer).",
    history:
      "Itsamia est citée parmi les sites de ponte des tortues vertes à Mohéli. Les conditions d'observation, la saison et les règles de comportement à respecter pour ne pas déranger les animaux sont à confirmer auprès des gestionnaires du parc.",
    practical: {
      access: tbc(),
      hours: tbc("L'observation se fait de nuit en période de ponte (à confirmer)."),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -12.36995,
    lng: 43.8679,
    status: "TO_CONFIRM",
    gallery: [
      { file: "plage-itsamia-1", alt: "Deux tortues marines nageant dans les eaux de Mohéli" },
      { file: "plage-itsamia-2", alt: "Plage de Mohéli encadrée de pandanus, face aux collines boisées" },
    ],
  },
  {
    slug: "pic-ntringui",
    name: "Pic Ntringui",
    island: "anjouan",
    category: "nature",
    summary:
      "Point culminant d'Anjouan à 1 595 m : crêtes boisées et randonnées dans l'intérieur de l'île.",
    history:
      "Le pic Ntringui est le plus haut sommet de Ndzuwani (1 595 m). Il domine les reliefs boisés qui occupent le centre de l'île. Les itinéraires, la durée de l'ascension et le recours à un guide restent à confirmer.",
    practical: {
      access: tbc(),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc(),
    },
    lat: -12.2148,
    lng: 44.42466,
    status: "TO_CONFIRM",
    gallery: [
      { file: "pic-ntringui-1", alt: "Le lac Dzialandzé entouré des forêts des hauts d'Anjouan" },
    ],
  },
  {
    slug: "marche-volo-volo",
    name: "Marché Volo-Volo",
    island: "grande-comore",
    category: "culture",
    summary:
      "Le grand marché de Moroni, au nord de la ville : fruits, épices, poissons et étals colorés.",
    history:
      "Volo-Volo est le plus grand des marchés de Moroni ; il se trouve dans le nord de la ville, à côté de l'ancien marché. C'est un lieu de vie quotidienne où l'on découvre les produits de l'archipel.",
    practical: {
      access: tbc("Dans le nord de Moroni."),
      hours: tbc(),
      fares: tbc(),
      bestPeriod: tbc("Le matin, quand les étals sont les plus fournis (à confirmer)."),
    },
    lat: -11.69169,
    lng: 43.25609,
    status: "TO_CONFIRM",
    gallery: [
      { file: "marche-volo-volo-2", alt: "Marchands sous des parasols colorés dans un marché de Moroni" },
      { file: "marche-volo-volo-3", alt: "Vendeuse de tissus et de vêtements colorés aux Comores" },
    ],
  },
];

async function main() {
  for (const i of ISLANDS) {
    await prisma.island.upsert({ where: { slug: i.slug }, update: i, create: i });
  }
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const islands = await prisma.island.findMany();
  const categories = await prisma.category.findMany();
  const islandId = (slug: string) => {
    const x = islands.find((i: { slug: string; id: number }) => i.slug === slug);
    if (!x) throw new Error(`Île inconnue : ${slug}`);
    return x.id;
  };
  const categoryId = (slug: string) => {
    const x = categories.find((c: { slug: string; id: number }) => c.slug === slug);
    if (!x) throw new Error(`Catégorie inconnue : ${slug}`);
    return x.id;
  };

  for (const p of SEED_PLACES) {
    const data = {
      name: p.name,
      summary: p.summary,
      history: p.history,
      practicalInfo: p.practical,
      lat: p.lat,
      lng: p.lng,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
      status: p.status,
      verifiedAt: p.status === "VERIFIED" ? VERIFIED_AT : null,
      coverImage: `/images/places/${p.gallery[0].file}.jpg`,
      coverAlt: p.gallery[0].alt,
      islandId: islandId(p.island),
      categoryId: categoryId(p.category),
    };
    const place = await prisma.place.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    await prisma.placeImage.deleteMany({
      where: { placeId: place.id, url: { startsWith: "/images/places/" } },
    });
    await prisma.placeImage.createMany({
      data: p.gallery.map((g, idx) => ({
        placeId: place.id,
        url: `/images/places/${g.file}.jpg`,
        alt: g.alt,
        order: idx,
      })),
    });
  }

  const existingAlert = await prisma.siteAlert.count();
  if (existingAlert === 0) {
    await prisma.siteAlert.create({
      data: {
        message: "Avis aux voyageurs : consultez les recommandations officielles avant de partir.",
        link: "/infos-voyageurs",
        active: true,
      },
    });
  }

  console.log(
    `Seed terminé : ${ISLANDS.length} îles, ${CATEGORIES.length} catégories, ${SEED_PLACES.length} lieux.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
