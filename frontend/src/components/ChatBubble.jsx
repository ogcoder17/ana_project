export default function ChatBubble({ side="buyer", text, meta }) {
  const cls =
    side === "system"
      ? "chat__row chat__row--system"
      : side === "seller"
      ? "chat__row chat__row--seller"
      : "chat__row chat__row--buyer";

  return (
    <div className={cls}>
      <div className={`chat__bubble chat__bubble--${side}`}>
        {text}
      </div>
      {meta ? <div className="chat__meta">{meta}</div> : null}
    </div>
  );
}