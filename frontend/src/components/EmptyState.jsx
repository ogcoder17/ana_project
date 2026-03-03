export default function EmptyState({ title, subtitle }) {
  return (
    <div className="empty">
      <div className="empty__t">{title}</div>
      <div className="empty__s">{subtitle}</div>
    </div>
  );
}