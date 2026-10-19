import { useSettings } from "../context/useSettings";

// Action Card: What is this / Do I need to act / By when (UI brief section 6)
// Every status = icon + text label, never colour alone.
export default function ActionCard({
  analysis,
  onReadFullText,
  onSeeText,
  onRetry,
  onBack,
}) {
  const { contrast, fontSize } = useSettings();
  const isHigh = contrast === "high";

  const c = {
    bg: isHigh ? "#000000" : "#FAF8F3",
    text: isHigh ? "#FFFFFF" : "#1A1A1A",
    card: isHigh ? "#121212" : "#FFFFFF",
    border: isHigh ? "#444444" : "#D8D3C8",
    primary: isHigh ? "#00C2C2" : "#0B6E6E",
    onPrimary: isHigh ? "#000000" : "#FFFFFF",
    secondaryBorder: isHigh ? "#8899A6" : "#4A5A6A",
    secondaryBg: isHigh ? "#1E1E1E" : "#FFFFFF",
    warn: isHigh ? "#FFB84D" : "#B8560A",
    danger: isHigh ? "#FF6B5E" : "#A3261A",
  };

  const {
    documentType,
    plainSummary,
    keyFields,
    fields,
    actionCard,
    warnings,
  } = analysis;
  const isMedicine = documentType === "medicine_label";
  const isForm = documentType === "form";

  const keyRows = [
    ["💰", "Amount", keyFields.amount],
    ["📅", "Due date", keyFields.dueDate],
    ["💊", "Dose printed on the label", keyFields.dosage],
    ["🕒", "Timing printed on the label", keyFields.timing],
  ].filter(([, , value]) => value);

  const body = { fontSize: `${fontSize}px`, margin: 0, lineHeight: 1.5 };

  return (
    <main style={{ ...styles.page, backgroundColor: c.bg, color: c.text }}>
      <h1 style={{ margin: 0 }}>Here is what I found</h1>

      {/* Safety box: above the fold, icon + text + border */}
      {warnings.length > 0 && (
        <section
          role="alert"
          style={{
            ...styles.warningBox,
            backgroundColor: c.card,
            borderColor: isMedicine ? c.danger : c.warn,
            color: c.text,
          }}
        >
          <h2 style={{ ...styles.h2, color: isMedicine ? c.danger : c.warn }}>
            ⚠️ {isMedicine ? "Safety notice" : "Please note"}
          </h2>
          {warnings.map((w, i) => (
            <p key={i} style={body}>
              {w}
            </p>
          ))}
        </section>
      )}

      <section
        style={{
          ...styles.section,
          backgroundColor: c.card,
          borderColor: c.border,
        }}
      >
        <h2 style={styles.h2}>📄 What is this?</h2>
        <p style={{ ...body, fontWeight: 700 }}>{actionCard.whatIsThis}</p>
        <p style={body}>{plainSummary}</p>
      </section>

      <section
        style={{
          ...styles.section,
          backgroundColor: c.card,
          borderColor: c.border,
        }}
      >
        <h2 style={styles.h2}>✋ Do I need to act?</h2>
        <p style={{ ...body, fontWeight: 700 }}>
          {actionCard.needsAction
            ? "⚠️ Yes, you need to do something"
            : "✅ No action needed"}
        </p>
      </section>

      <section
        style={{
          ...styles.section,
          backgroundColor: c.card,
          borderColor: c.border,
        }}
      >
        <h2 style={styles.h2}>📅 By when?</h2>
        <p style={{ ...body, fontWeight: 700 }}>
          {actionCard.byWhen || "I did not find a date"}
        </p>
      </section>

      {keyRows.length > 0 && (
        <section
          style={{
            ...styles.section,
            backgroundColor: c.card,
            borderColor: c.border,
          }}
        >
          <h2 style={styles.h2}>🔎 Details I found</h2>
          {keyRows.map(([icon, label, value]) => (
            <p key={label} style={body}>
              {icon} {label}: <strong>{value}</strong>
            </p>
          ))}
        </section>
      )}

      {/* Form Result: one card per field, same order as on the form */}
      {isForm && (
        <>
          <h2 style={{ ...styles.h2, margin: "8px 0 0" }}>
            📝 What each box means
          </h2>
          {fields.length === 0 && (
            <p style={body}>
              I could not find any boxes. Please scan the form again, closer.
            </p>
          )}
          {fields.map((f, i) => (
            <section
              key={i}
              style={{
                ...styles.section,
                backgroundColor: c.card,
                borderColor: c.border,
              }}
            >
              <p style={{ ...body, fontWeight: 700 }}>{f.label}</p>
              <p style={body}>{f.meaning}</p>
              {f.expects && <p style={body}>✏️ Write: {f.expects}</p>}
            </section>
          ))}
        </>
      )}

      <button
        style={{
          ...styles.primary,
          backgroundColor: c.primary,
          color: c.onPrimary,
        }}
        onClick={onReadFullText}
      >
        📖 Read full text
      </button>

      <div style={styles.row}>
        <button
          style={{
            ...styles.secondary,
            backgroundColor: c.secondaryBg,
            color: c.text,
            borderColor: c.secondaryBorder,
          }}
          onClick={onSeeText}
        >
          🔤 See the text
        </button>
        <button
          style={{
            ...styles.secondary,
            backgroundColor: c.secondaryBg,
            color: c.text,
            borderColor: c.secondaryBorder,
          }}
          onClick={onRetry}
        >
          📷 Scan again
        </button>
      </div>
      <button
        style={{
          ...styles.secondary,
          backgroundColor: c.secondaryBg,
          color: c.text,
          borderColor: c.secondaryBorder,
        }}
        onClick={onBack}
      >
        🏠 Home
      </button>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxSizing: "border-box",
  },
  h2: { fontSize: 22, margin: "0 0 8px" },
  section: { padding: 16, border: "2px solid", borderRadius: 14 },
  warningBox: { padding: 16, border: "4px solid", borderRadius: 14 },
  primary: {
    minHeight: 64,
    fontSize: 22,
    fontWeight: 700,
    borderRadius: 14,
    border: 0,
  },
  secondary: {
    minHeight: 56,
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 12,
    border: "2px solid",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
};
