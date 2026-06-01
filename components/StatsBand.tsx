export default function StatsBand() {
  const stats = [
    { num: "15.000+", label: "Zadovoljnih otrok" },
    { num: "35+", label: "Učiteljev in trenerjev" },
    { num: "6.570+", label: "Dni obstoja" },
    { num: "10+", label: "Različnih aktivnosti" },
  ];

  return (
    <section className="relative bg-brand-navy text-white border-t-[3px] border-brand-orange">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center relative ${
                i < stats.length - 1
                  ? "lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-[20%] lg:after:bottom-[20%] lg:after:w-px lg:after:bg-white/15"
                  : ""
              }`}
            >
              <div className="text-3xl lg:text-4xl font-extrabold text-brand-orange leading-none mb-1.5 tracking-tight">
                {stat.num}
              </div>
              <div className="text-[11px] text-white/70 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
