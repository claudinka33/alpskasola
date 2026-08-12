// Foto pas — mozaik utrinkov iz življenja društva
// TODO: fotografije zamenjaj/dopolni z novejšimi, ko jih dobimo
const fotke = [
  { src: "/tekmovalna_1.JPG", alt: "Priprave na ledeniku" },
  { src: "/smucanje.jpg", alt: "Tečaj smučanja na Rogli" },
  { src: "/akademija.jpeg", alt: "Poletni tabor v Baški" },
  { src: "/abeceda.JPG", alt: "Športna abeceda v telovadnici" },
  { src: "/zacenja-zgodba.jpg", alt: "Smučarska tekma" },
];

export default function FotoPas() {
  return (
    <section className="bg-white py-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 px-1.5">
        {fotke.map((f, i) => (
          <div
            key={i}
            className={`relative overflow-hidden aspect-square rounded-lg ${
              i === 4 ? "hidden md:block" : ""
            }`}
          >
            <img
              src={f.src}
              alt={f.alt}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
