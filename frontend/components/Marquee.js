/** Marquee — an infinite horizontal scrolling strip (duplicates content 2x). */
export default function Marquee({ items = [], speed = 34, className = "" }) {
  const row = [items, items].flat().map((item, i) => (
    <span className="marquee-item" key={`${item}-${i}`} aria-hidden={i >= items.length}>
      <span className="marquee-item__text">{item}</span>
      <span className="marquee-item__star" aria-hidden="true">✦</span>
    </span>
  ));

  return (
    <div className="marquee" style={{ "--marquee-speed": `${speed}s` }}>
      <div className="marquee-track">{row}</div>
    </div>
  );
}