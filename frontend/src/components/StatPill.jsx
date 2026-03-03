export default function StatPill({ icon, title, subtitle }) {
  return (
    <div className="stat">
      <div className="stat__t">{icon} {title}</div>
      <div className="stat__s">{subtitle}</div>
    </div>
  );
}