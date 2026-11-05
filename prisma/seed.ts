import { PrismaClient, type Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildSearchText, type TripContent, type TripTranslations } from "../src/lib/trip-content";

/**
 * Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD and, on an empty
 * destinations table, a set of SAMPLE trips. Trips, prices (in dinars) and dates
 * are illustrative and should be replaced through the admin dashboard before launch.
 */
const prisma = new PrismaClient();

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const step = (title: string, description: string) => ({ title, description });

type Trip = {
  category: Category;
  price: number;
  durationDays: number;
  startInDays: number;
  endInDays: number;
  capacity: number;
  featured: boolean;
  images: string[];
  content: { ar: TripContent; fr: TripContent; en: TripContent };
};

const trips: Trip[] = [
  {
    category: "UMRAH",
    price: 290000,
    durationDays: 12,
    startInDays: 30,
    endInDays: 150,
    capacity: 60,
    featured: true,
    images: ["1591604129939-f1efa4d9f7fa", "1564769625905-50e93615e769", "1565019011521-b0575cbb57c8"].map(photo),
    content: {
      ar: {
        title: "عمرة ميسّرة",
        location: "مكة المكرمة والمدينة المنورة، السعودية",
        summary: "عمرة منظمة بلا استعجال، مع فنادق قريبة من الحرمين الشريفين.",
        description:
          "برنامج عمرة متكامل للأفراد والعائلات. يتكفل مرشد الفوج بكل التفاصيل من الانطلاق إلى العودة، لتتفرغ أنت للعبادة. تقيم على مسافة قريبة من المسجد الحرام والمسجد النبوي، مع مزارات مرافقة في المدينتين.",
        included: ["تذاكر الطيران ذهابًا وإيابًا", "إجراءات تأشيرة العمرة", "فنادق قريبة من الحرمين", "التنقل من المطار وبين المدينتين", "مرشد ديني", "فطور الصباح يوميًا"],
        excluded: ["المصاريف الشخصية", "الغداء والعشاء", "تأمين السفر"],
        itinerary: [
          step("الوصول إلى المدينة المنورة", "الاستقبال في المطار، النزول في الفندق وزيارة المسجد النبوي."),
          step("أيام المدينة المنورة", "الصلاة في المسجد النبوي وزيارة المعالم التاريخية مع المرشد."),
          step("التوجه إلى مكة المكرمة", "الإحرام من الميقات وأداء العمرة مع المرشد."),
          step("أيام مكة المكرمة", "وقت حر للعبادة وزيارة منظمة للمعالم التاريخية."),
          step("العودة إلى الجزائر", "نقل جماعي إلى المطار لرحلة العودة."),
        ],
      },
      fr: {
        title: "Omra Essentielle",
        location: "La Mecque et Médine, Arabie saoudite",
        summary: "Une Omra encadrée et sans précipitation, avec des hôtels proches des deux Lieux saints.",
        description:
          "Un programme d'Omra complet pour les particuliers et les familles. Votre guide s'occupe de la logistique du départ au retour, pour que vous puissiez vous consacrer à l'adoration. Vous logez à proximité de la mosquée Al-Haram et de la mosquée du Prophète, avec des visites guidées dans les deux villes.",
        included: ["Vols aller-retour", "Démarches de visa Omra", "Hôtels proches des Lieux saints", "Transferts aéroport et entre les villes", "Guide religieux", "Petit-déjeuner quotidien"],
        excluded: ["Dépenses personnelles", "Déjeuners et dîners", "Assurance voyage"],
        itinerary: [
          step("Arrivée à Médine", "Accueil à l'aéroport, installation à l'hôtel et visite de la mosquée du Prophète."),
          step("Séjour à Médine", "Prières à la mosquée du Prophète et visite guidée des sites historiques."),
          step("Départ pour La Mecque", "Ihram au miqat et accomplissement de la Omra avec votre guide."),
          step("Séjour à La Mecque", "Temps libre pour l'adoration et visite guidée des sites historiques."),
          step("Retour en Algérie", "Transfert en groupe à l'aéroport pour le vol de retour."),
        ],
      },
      en: {
        title: "Umrah Essentials",
        location: "Makkah & Madinah, Saudi Arabia",
        summary: "A guided, unhurried Umrah with hotels close to both Holy Mosques.",
        description:
          "A complete Umrah program for individuals and families. Your group leader handles the logistics from departure to return, so your attention stays on worship. You stay within walking distance of Masjid al-Haram and Al-Masjid an-Nabawi, with guided ziyarat in both cities.",
        included: ["Return flights", "Umrah visa processing", "Hotels near the Holy Mosques", "Airport and intercity transfers", "Religious guide", "Daily breakfast"],
        excluded: ["Personal expenses", "Lunch and dinner", "Travel insurance"],
        itinerary: [
          step("Arrival in Madinah", "Airport reception, hotel check-in and time to visit the Prophet's Mosque."),
          step("Days in Madinah", "Prayers at Al-Masjid an-Nabawi and guided visits to the historic sites."),
          step("Travel to Makkah", "Enter ihram at the miqat and perform Umrah with your guide."),
          step("Days in Makkah", "Free time for worship, plus a guided visit to the historic sites."),
          step("Return to Algeria", "Group transfer to the airport for the flight home."),
        ],
      },
    },
  },
  {
    category: "UMRAH",
    price: 450000,
    durationDays: 14,
    startInDays: 60,
    endInDays: 130,
    capacity: 40,
    featured: false,
    images: ["1564769625905-50e93615e769", "1591604129939-f1efa4d9f7fa"].map(photo),
    content: {
      ar: {
        title: "عمرة رمضان",
        location: "مكة المكرمة، السعودية",
        summary: "العشر الأواخر من رمضان، على بعد خطوات من المسجد الحرام.",
        description:
          "اقضِ أعظم ليالي السنة في مكة المكرمة. برنامج خفيف يتيح لك التفرغ للصلاة، مع فندق قريب من الحرم ومرشد متمرس يرافقك طوال الرحلة.",
        included: ["تذاكر الطيران ذهابًا وإيابًا", "إجراءات تأشيرة العمرة", "فندق قريب من المسجد الحرام", "السحور والإفطار", "التنقلات"],
        excluded: ["المصاريف الشخصية", "تأمين السفر"],
        itinerary: [
          step("الوصول إلى مكة المكرمة", "النزول في الفندق ثم أداء العمرة مع المرشد."),
          step("العشر الأواخر", "صلاة التراويح والقيام في الحرم على راحتك."),
          step("العيد والعودة", "صلاة العيد في مكة ثم التوجه إلى المطار."),
        ],
      },
      fr: {
        title: "Omra du Ramadan",
        location: "La Mecque, Arabie saoudite",
        summary: "Les dix derniers jours du Ramadan, à quelques pas de la mosquée Al-Haram.",
        description:
          "Passez les nuits les plus bénies de l'année à La Mecque. Un programme léger pour vous consacrer à la prière, avec un hôtel proche du Haram et un guide expérimenté tout au long du séjour.",
        included: ["Vols aller-retour", "Démarches de visa Omra", "Hôtel proche de la mosquée Al-Haram", "Shour et iftar", "Transferts"],
        excluded: ["Dépenses personnelles", "Assurance voyage"],
        itinerary: [
          step("Arrivée à La Mecque", "Installation à l'hôtel, puis Omra avec votre guide."),
          step("Les dix dernières nuits", "Tarawih et Qiyam au Haram à votre rythme."),
          step("Aïd et retour", "Prière de l'Aïd à La Mecque, puis transfert vers l'aéroport."),
        ],
      },
      en: {
        title: "Ramadan Umrah",
        location: "Makkah, Saudi Arabia",
        summary: "The last ten days of Ramadan, steps from Masjid al-Haram.",
        description:
          "Spend the most blessed nights of the year in Makkah. This program keeps the schedule light so you can focus on prayer, with a hotel moments from the Haram and an experienced guide on hand throughout.",
        included: ["Return flights", "Umrah visa processing", "Hotel near Masjid al-Haram", "Suhoor and iftar", "Transfers"],
        excluded: ["Personal expenses", "Travel insurance"],
        itinerary: [
          step("Arrival in Makkah", "Hotel check-in, then perform Umrah with your guide."),
          step("The last ten nights", "Taraweeh and Qiyam at the Haram at your own pace."),
          step("Eid and return", "Eid prayer in Makkah followed by the transfer to the airport."),
        ],
      },
    },
  },
  {
    category: "INTERNATIONAL",
    price: 165000,
    durationDays: 7,
    startInDays: 21,
    endInDays: 200,
    capacity: 50,
    featured: true,
    images: ["1524231757912-21f4fe3a7200", "1541432901042-2d8bd64b4a9b"].map(photo),
    content: {
      ar: {
        title: "اكتشاف إسطنبول",
        location: "إسطنبول، تركيا",
        summary: "قارتان، مساجد عريقة وأمسيات على ضفاف البوسفور.",
        description:
          "اكتشف المدينة التي تجمع بين أوروبا وآسيا. تجول في السلطان أحمد مع مرشد محلي، زر المسجد الأزرق وقصر توبكابي، تسوق في البازار الكبير واختم يومك برحلة بحرية عند الغروب في البوسفور.",
        included: ["تذاكر الطيران ذهابًا وإيابًا", "فندق 4 نجوم وسط المدينة", "فطور الصباح يوميًا", "جولات منظمة في المدينة", "رحلة بحرية في البوسفور"],
        excluded: ["رسوم التأشيرة عند الاقتضاء", "الغداء والعشاء", "المصاريف الشخصية"],
        itinerary: [
          step("الوصول إلى إسطنبول", "النقل من المطار وأمسية هادئة قرب الفندق."),
          step("المدينة القديمة", "المسجد الأزرق وآيا صوفيا وقصر توبكابي مع مرشد معتمد."),
          step("البازار والبوسفور", "البازار الكبير وسوق التوابل ورحلة بحرية عند الغروب."),
          step("أيام حرة", "استكشف المدينة على راحتك أو أضف رحلة اختيارية."),
          step("المغادرة", "النقل إلى المطار لرحلة العودة."),
        ],
      },
      fr: {
        title: "Découverte d'Istanbul",
        location: "Istanbul, Turquie",
        summary: "Deux continents, de grandes mosquées et des soirées sur le Bosphore.",
        description:
          "Explorez la ville entre Europe et Asie. Parcourez Sultanahmet avec un guide local, visitez la Mosquée bleue et le palais de Topkapi, flânez au Grand Bazar et terminez par une croisière au coucher du soleil sur le Bosphore.",
        included: ["Vols aller-retour", "Hôtel 4 étoiles en centre-ville", "Petit-déjeuner quotidien", "Visites guidées de la ville", "Croisière sur le Bosphore"],
        excluded: ["Frais de visa, le cas échéant", "Déjeuners et dîners", "Dépenses personnelles"],
        itinerary: [
          step("Arrivée à Istanbul", "Transfert depuis l'aéroport et soirée détente près de l'hôtel."),
          step("Vieille ville", "Mosquée bleue, Sainte-Sophie et palais de Topkapi avec un guide agréé."),
          step("Bazars et Bosphore", "Grand Bazar, marché aux épices et croisière au coucher du soleil."),
          step("Journées libres", "Explorez à votre rythme ou ajoutez une excursion en option."),
          step("Départ", "Transfert à l'aéroport pour votre vol de retour."),
        ],
      },
      en: {
        title: "Istanbul Discovery",
        location: "Istanbul, Türkiye",
        summary: "Two continents, grand mosques and Bosphorus evenings.",
        description:
          "Explore the city that spans Europe and Asia. Walk through Sultanahmet with a local guide, visit the Blue Mosque and Topkapi Palace, shop the Grand Bazaar and end with a sunset cruise on the Bosphorus.",
        included: ["Return flights", "4-star central hotel", "Daily breakfast", "Guided city tours", "Bosphorus cruise"],
        excluded: ["Visa fees, if applicable", "Lunch and dinner", "Personal expenses"],
        itinerary: [
          step("Arrive in Istanbul", "Airport transfer and a relaxed evening near your hotel."),
          step("Old City", "Blue Mosque, Hagia Sophia and Topkapi Palace with a licensed guide."),
          step("Bazaars and the Bosphorus", "Grand Bazaar, Spice Market and a sunset cruise."),
          step("Free days", "Explore at your own pace or add an optional day trip."),
          step("Departure", "Transfer to the airport for your flight home."),
        ],
      },
    },
  },
  {
    category: "INTERNATIONAL",
    price: 340000,
    durationDays: 9,
    startInDays: 40,
    endInDays: 240,
    capacity: 30,
    featured: true,
    images: ["1537996194471-e657df975ab4", "1507525428034-b723cf961d3e"].map(photo),
    content: {
      ar: {
        title: "جزيرة بالي",
        location: "بالي، إندونيسيا",
        summary: "مدرجات الأرز، منحدرات البحر وأيام هادئة قرب الماء.",
        description:
          "عطلة متوازنة بين تلال أوبود الخضراء والساحل الجنوبي. شلالات ومعابد وأوقات على الشاطئ، مع تنقلات خاصة تجعل كل شيء سهلًا.",
        included: ["تذاكر الطيران ذهابًا وإيابًا", "فنادق مميزة", "فطور الصباح يوميًا", "تنقلات خاصة", "جولتان منظمتان"],
        excluded: ["التأشيرة عند الوصول", "الغداء والعشاء", "الأنشطة الاختيارية"],
        itinerary: [
          step("الوصول إلى بالي", "نقل خاص إلى أوبود والنزول في الفندق."),
          step("أوبود", "مدرجات الأرز والشلالات وأسواق الحرف."),
          step("نحو الساحل", "معبد أولواتو عند الغروب وعشاء بحري على الشاطئ."),
          step("أيام الشاطئ", "وقت حر للسباحة والراحة أو رحلة بالقارب."),
          step("المغادرة", "النقل إلى المطار لرحلة العودة."),
        ],
      },
      fr: {
        title: "Évasion à Bali",
        location: "Bali, Indonésie",
        summary: "Rizières en terrasses, falaises marines et journées paisibles au bord de l'eau.",
        description:
          "Des vacances équilibrées entre les collines verdoyantes d'Ubud et la côte sud. Cascades, temples et plages, avec des transferts privés pour des déplacements simples.",
        included: ["Vols aller-retour", "Hôtels de charme", "Petit-déjeuner quotidien", "Transferts privés", "Deux excursions guidées"],
        excluded: ["Visa à l'arrivée", "Déjeuners et dîners", "Activités en option"],
        itinerary: [
          step("Arrivée à Bali", "Transfert privé vers Ubud et installation à l'hôtel."),
          step("Ubud", "Rizières en terrasses, cascades et marchés d'artisanat."),
          step("Vers la côte", "Temple d'Uluwatu au coucher du soleil et dîner de poisson sur la plage."),
          step("Journées à la plage", "Temps libre pour nager, se reposer ou partir en bateau."),
          step("Départ", "Transfert à l'aéroport pour votre vol de retour."),
        ],
      },
      en: {
        title: "Bali Island Escape",
        location: "Bali, Indonesia",
        summary: "Rice terraces, sea cliffs and slow days by the water.",
        description:
          "A balanced island holiday split between the green hills of Ubud and the southern coast. Expect waterfalls, temples and beach time, with private transfers so that getting around stays easy.",
        included: ["Return flights", "Boutique hotels", "Daily breakfast", "Private transfers", "Two guided day tours"],
        excluded: ["Visa on arrival", "Lunch and dinner", "Optional activities"],
        itinerary: [
          step("Arrive in Bali", "Private transfer to Ubud and hotel check-in."),
          step("Ubud", "Rice terraces, waterfalls and the art markets."),
          step("To the coast", "Uluwatu temple at sunset and a seafood dinner by the beach."),
          step("Beach days", "Free time to swim, relax or join a boat trip."),
          step("Departure", "Transfer to the airport for your flight home."),
        ],
      },
    },
  },
  {
    category: "LUXURY",
    price: 620000,
    durationDays: 6,
    startInDays: 90,
    endInDays: 280,
    capacity: 12,
    featured: true,
    images: ["1570077188670-e3a8d69ac5ff", "1613395877344-13d4a8e0d49e"].map(photo),
    content: {
      ar: {
        title: "إقامة خاصة في سانتوريني",
        location: "سانتوريني، اليونان",
        summary: "جناح مطل على الكالديرا، تنقلات خاصة وغروب على متن قارب.",
        description:
          "أكثر برامجنا راحة: جناح على المنحدر في أويا، رحلة خاصة بالقارب حول الكالديرا، ومساعد شخصي يتكفل بكل الحجوزات حتى لا تحتاج إلى النظر في أي جدول مواعيد.",
        included: ["تذاكر طيران درجة رجال الأعمال", "جناح مطل على الكالديرا", "تنقلات خاصة", "رحلة خاصة بالقارب", "مساعد شخصي"],
        excluded: ["رسوم تأشيرة شنغن", "الغداء والعشاء", "خدمات السبا"],
        itinerary: [
          step("الوصول إلى سانتوريني", "نقل خاص إلى جناحك في أويا."),
          step("أويا وفيرا", "جولة مع مرشد على طريق الكالديرا."),
          step("في عرض البحر", "رحلة خاصة بالقارب مع عشاء عند الغروب."),
          step("المغادرة", "نقل خاص إلى المطار."),
        ],
      },
      fr: {
        title: "Séjour privé à Santorin",
        location: "Santorin, Grèce",
        summary: "Suite avec vue sur la caldeira, transferts privés et coucher de soleil en catamaran.",
        description:
          "Notre programme le plus reposant : une suite à flanc de falaise à Oia, une croisière privée en catamaran autour de la caldeira et un concierge personnel qui gère vos réservations.",
        included: ["Vols en classe affaires", "Suite avec vue sur la caldeira", "Transferts privés", "Croisière privée en catamaran", "Concierge personnel"],
        excluded: ["Frais de visa Schengen", "Déjeuners et dîners", "Soins au spa"],
        itinerary: [
          step("Arrivée à Santorin", "Transfert privé vers votre suite à Oia."),
          step("Oia et Fira", "Promenade guidée sur le sentier de la caldeira."),
          step("Sur l'eau", "Croisière privée en catamaran avec dîner au coucher du soleil."),
          step("Départ", "Transfert privé à l'aéroport."),
        ],
      },
      en: {
        title: "Santorini Private Retreat",
        location: "Santorini, Greece",
        summary: "A caldera-view suite, private transfers and a catamaran sunset.",
        description:
          "Our most relaxed itinerary: a cliffside suite in Oia, a private catamaran cruise around the caldera, and a personal concierge who handles reservations so you never need to look at a timetable.",
        included: ["Business class flights", "Caldera-view suite", "Private transfers", "Private catamaran cruise", "Personal concierge"],
        excluded: ["Schengen visa fees", "Lunch and dinner", "Spa treatments"],
        itinerary: [
          step("Arrive in Santorini", "Private transfer to your suite in Oia."),
          step("Oia and Fira", "Guided walk along the caldera path."),
          step("On the water", "Private catamaran cruise, with dinner on board at sunset."),
          step("Departure", "Private transfer to the airport."),
        ],
      },
    },
  },
  {
    category: "LUXURY",
    price: 540000,
    durationDays: 8,
    startInDays: 75,
    endInDays: 260,
    capacity: 20,
    featured: false,
    images: ["1476514525535-07fb3b4ae5f1", "1506905925346-21bda4d32df4"].map(photo),
    content: {
      ar: {
        title: "بانوراما جبال الألب السويسرية",
        location: "لوسيرن وإنترلاكن، سويسرا",
        summary: "قطارات بانورامية، بحيرات جليدية ومناظر من قمم الجبال.",
        description:
          "سافر عبر قلب سويسرا بالقطار البانورامي. أقم في لوسيرن على ضفاف البحيرة وفي إنترلاكن الجبلية، مع يوم على قمم الألب وبطاقات قطار من الدرجة الأولى طوال الرحلة.",
        included: ["تذاكر الطيران ذهابًا وإيابًا", "فنادق 5 نجوم", "بطاقة قطار سويسرية درجة أولى", "رحلة جبلية", "فطور الصباح يوميًا"],
        excluded: ["رسوم تأشيرة شنغن", "الغداء والعشاء", "المصاريف الشخصية"],
        itinerary: [
          step("الوصول إلى لوسيرن", "القطار من زيورخ وجولة في المدينة القديمة."),
          step("بحيرة لوسيرن", "رحلة بالقارب وقطار مسنن إلى الجبل."),
          step("إنترلاكن", "قطار بانورامي بين البحيرات إلى جبال الألب البيرنية."),
          step("قمم الألب", "رحلة يوم كامل إلى القمم والأنهار الجليدية."),
          step("المغادرة", "القطار إلى زيورخ لرحلة العودة."),
        ],
      },
      fr: {
        title: "Panorama des Alpes suisses",
        location: "Lucerne et Interlaken, Suisse",
        summary: "Trains panoramiques, lacs glaciaires et vues depuis les sommets.",
        description:
          "Traversez le cœur de la Suisse en train panoramique. Séjournez à Lucerne au bord du lac et à Interlaken en montagne, avec une journée au sommet des Alpes et des billets de train en première classe.",
        included: ["Vols aller-retour", "Hôtels 5 étoiles", "Swiss Travel Pass en première classe", "Excursion en montagne", "Petit-déjeuner quotidien"],
        excluded: ["Frais de visa Schengen", "Déjeuners et dîners", "Dépenses personnelles"],
        itinerary: [
          step("Arrivée à Lucerne", "Train depuis Zurich et promenade dans la vieille ville."),
          step("Lac des Quatre-Cantons", "Croisière sur le lac et train à crémaillère vers la montagne."),
          step("Interlaken", "Train panoramique entre les lacs vers l'Oberland bernois."),
          step("Sommet des Alpes", "Excursion d'une journée vers les sommets et les glaciers."),
          step("Départ", "Train vers Zurich pour votre vol de retour."),
        ],
      },
      en: {
        title: "Swiss Alps Panorama",
        location: "Lucerne & Interlaken, Switzerland",
        summary: "Grand railways, glacier lakes and mountain-top views.",
        description:
          "Travel through the heart of Switzerland by panoramic train. Stay in lakeside Lucerne and mountain Interlaken, with a day at the top of the Alps and first-class rail passes throughout.",
        included: ["Return flights", "5-star hotels", "First-class Swiss Travel Pass", "Mountain excursion", "Daily breakfast"],
        excluded: ["Schengen visa fees", "Lunch and dinner", "Personal expenses"],
        itinerary: [
          step("Arrive in Lucerne", "Rail transfer from Zurich and a walk through the old town."),
          step("Lake Lucerne", "Lake cruise and a cogwheel train up the mountain."),
          step("Interlaken", "Panoramic train between the lakes to the Bernese Oberland."),
          step("Top of the Alps", "Full-day excursion to the high peaks and glaciers."),
          step("Departure", "Rail transfer to Zurich for your flight home."),
        ],
      },
    },
  },
  {
    category: "DOMESTIC",
    price: 18000,
    durationDays: 3,
    startInDays: 10,
    endInDays: 180,
    capacity: 35,
    featured: false,
    images: ["1469474968028-56623f02e42e", "1506905925346-21bda4d32df4"].map(photo),
    content: {
      ar: {
        title: "عطلة نهاية الأسبوع في تيكجدة",
        location: "تيكجدة، جرجرة، البويرة",
        summary: "استراحة قصيرة في جبال جرجرة، انطلاقًا من البليدة.",
        description:
          "عطلة دون مطار. تنطلق بالحافلة من وكالتنا في البليدة، تقيم في تيكجدة، وتقضي يومين بين المسارات الجبلية مع مرشد محلي ووجبات تقليدية.",
        included: ["النقل بالحافلة من البليدة", "ليلتان إقامة", "جميع الوجبات", "مرشد محلي"],
        excluded: ["المصاريف الشخصية", "الأنشطة الاختيارية"],
        itinerary: [
          step("الانطلاق", "الحافلة صباحًا من الوكالة وجولة مسائية خفيفة."),
          step("في قلب الجبال", "يوم كامل من المشي مع المرشد، ثم العشاء."),
          step("العودة", "صبيحة هادئة ثم الحافلة إلى البليدة مساءً."),
        ],
      },
      fr: {
        title: "Week-end à Tikjda",
        location: "Tikjda, Djurdjura, Bouira",
        summary: "Une courte escapade dans le Djurdjura, au départ de Blida.",
        description:
          "Un week-end sans aéroport. Départ en autocar depuis notre agence de Blida, séjour à Tikjda et deux jours sur les sentiers de montagne avec un guide local et des repas traditionnels.",
        included: ["Autocar depuis Blida", "Deux nuits d'hébergement", "Tous les repas", "Guide local"],
        excluded: ["Dépenses personnelles", "Activités en option"],
        itinerary: [
          step("Départ", "Autocar le matin depuis l'agence et promenade en fin de journée."),
          step("Au cœur des montagnes", "Une journée de randonnée guidée, puis le dîner."),
          step("Retour", "Matinée tranquille, puis retour en autocar à Blida le soir."),
        ],
      },
      en: {
        title: "Tikjda Weekend",
        location: "Tikjda, Djurdjura, Bouira",
        summary: "A short break in the Djurdjura mountains, departing from Blida.",
        description:
          "A weekend away without the airport. Travel by coach from our office in Blida, stay in Tikjda, and spend two days on mountain trails with a local guide and traditional meals.",
        included: ["Coach from Blida", "Two nights' accommodation", "All meals", "Local guide"],
        excluded: ["Personal expenses", "Optional activities"],
        itinerary: [
          step("Departure", "Morning coach from the agency, with a short evening walk."),
          step("Into the mountains", "A full day's guided walk, then dinner."),
          step("Return", "A slow morning, then the coach back to Blida by evening."),
        ],
      },
    },
  },
  {
    category: "DOMESTIC",
    price: 32000,
    durationDays: 4,
    startInDays: 14,
    endInDays: 210,
    capacity: 40,
    featured: false,
    images: ["1507525428034-b723cf961d3e", "1469474968028-56623f02e42e"].map(photo),
    content: {
      ar: {
        title: "ساحل بجاية وتراثها",
        location: "بجاية، الجزائر",
        summary: "مدينة عريقة وشواطئ طويلة، أربعة أيام غير بعيد عن البيت.",
        description:
          "اكتشف ما هو قريب منك. رحلة بالحافلة تجمع بين المعالم التاريخية والأمسيات الحرة على الساحل، مع إقامة مريحة في فندق قرب البحر.",
        included: ["النقل بالحافلة من البليدة", "ثلاث ليال في فندق ساحلي", "نصف إقامة", "زيارات منظمة ورسوم الدخول"],
        excluded: ["الغداء", "المصاريف الشخصية"],
        itinerary: [
          step("إلى الساحل", "الانطلاق من الوكالة والنزول في الفندق قرب البحر."),
          step("المدينة القديمة", "صبيحة مع المرشد بين المعالم، ومساء حر."),
          step("يوم الشاطئ", "يوم كامل للراحة أو رحلة اختيارية بالقارب."),
          step("العودة", "توقف عند معلم تراثي في طريق العودة."),
        ],
      },
      fr: {
        title: "Côte et patrimoine de Béjaïa",
        location: "Béjaïa, Algérie",
        summary: "Une ville historique et de longues plages, quatre jours près de chez vous.",
        description:
          "Découvrez ce qui est tout près. Ce circuit en autocar associe sites historiques et après-midi libres sur la côte, dans un hôtel confortable en bord de mer.",
        included: ["Autocar depuis Blida", "Trois nuits en hôtel balnéaire", "Demi-pension", "Visites guidées et entrées"],
        excluded: ["Déjeuners", "Dépenses personnelles"],
        itinerary: [
          step("Vers la côte", "Départ de l'agence et installation en bord de mer."),
          step("Vieille ville", "Matinée guidée parmi les monuments, après-midi libre."),
          step("Journée plage", "Une journée de détente ou une sortie en bateau en option."),
          step("Retour", "Une halte patrimoniale sur le chemin du retour."),
        ],
      },
      en: {
        title: "Béjaïa Coast & Heritage",
        location: "Béjaïa, Algeria",
        summary: "A historic city and long beaches, four days from home.",
        description:
          "Discover what's close to home. This coach tour links historic sites with free afternoons on the coast, in a comfortable seaside hotel.",
        included: ["Coach from Blida", "Three nights' seaside hotel", "Half board", "Guided visits and entry fees"],
        excluded: ["Lunch", "Personal expenses"],
        itinerary: [
          step("To the coast", "Depart from the agency and check in by the sea."),
          step("Old town", "A guided morning among the monuments, with the afternoon free."),
          step("Beach day", "A full day to relax, or an optional boat trip."),
          step("Return", "A heritage stop on the road home."),
        ],
      },
    },
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password === "replace-me" || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in .env before seeding.");
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { name: "Agency Admin", email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Admin account ready: ${email}`);

  if ((await prisma.destination.count()) === 0) {
    await prisma.destination.createMany({
      data: trips.map(({ startInDays, endInDays, content, ...trip }) => ({
        ...trip,
        startDate: daysFromNow(startInDays),
        endDate: daysFromNow(endInDays),
        content: content satisfies TripTranslations,
        searchText: buildSearchText(content),
      })),
    });
    console.log(`Created ${trips.length} sample trips.`);
  } else {
    console.log("Destinations already exist; leaving them untouched.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
