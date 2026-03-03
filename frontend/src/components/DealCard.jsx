import Button from "./Button";

export default function DealCard({ deal, onSelect }) {
  return (
    <div className="card card--deal">
      <div className="deal__top">
        <div className="deal__title">📱 {deal.brand} • {deal.model}</div>
        <div className="pill">🛍️ {deal.seller}</div>
      </div>

      <div className="deal__priceRow">
        <div className="deal__price">₹{deal.price}</div>
        <div className="deal__meta">✨ {deal.highlights}</div>
      </div>

      <div className="deal__actions">
        <a className="link" href={deal.url} target="_blank" rel="noreferrer">🔗 View link</a>
        <Button variant="primary" onClick={() => onSelect(deal)}>✅ Select</Button>
      </div>
    </div>
  );
}