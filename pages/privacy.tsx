export default function PrivacyPage() {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "42px 24px 72px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>
          Privacy Policy
        </h1>
  
        <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
          We collect only the information you voluntarily provide, such as email
          addresses submitted through the contact form.
        </p>
  
        <p style={{ color: "#6b7280", lineHeight: 1.7, marginTop: 12 }}>
          We do not sell, trade, or share personal information with third
          parties.
        </p>
  
        <p style={{ color: "#6b7280", lineHeight: 1.7, marginTop: 12 }}>
          Basic analytics may be used to understand site performance. These
          services may collect anonymized usage data.
        </p>
  
        <p style={{ color: "#6b7280", lineHeight: 1.7, marginTop: 12 }}>
          By using this site, you consent to this policy.
        </p>
      </main>
    );
  }