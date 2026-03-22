export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>

      <div className="fade-up" style={{ marginBottom: "3rem", maxWidth: 700 }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Legal</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
        }}>
          Privacy Policy
        </h1>
        <div className="divider" />
        <p style={{
          marginTop: "1.25rem",
          color: "var(--text-dim)",
          fontSize: "0.9rem",
          lineHeight: 1.8,
          fontFamily: "var(--font-body)",
        }}>
          Last updated: March 2026
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 3rem" }} />

      <div className="privacy-layout fade-up-delay-1">
        <div style={{ minWidth: 0 }}>

          {[
            {
              title: "Who we are",
              body: `The People's Verdict ("TPV", "we", "us") is a political analysis publication operating at tpverdict.com. You can contact us at ello.axia@gmail.com with any questions about this policy.`,
            },
            {
              title: "What we collect",
              body: null,
              list: [
                { label: "Account information", desc: "When you create an account, we collect your email address and any profile information you choose to provide, including username, year of birth, gender, race/ethnicity, education level, household income, and political affiliation." },
                { label: "Usage data", desc: "We may collect anonymized data about how you interact with the site, including pages visited, time spent, and actions taken (such as voting on polls). This data does not identify you personally." },
                { label: "Communications", desc: "If you contact us via the contact form or email, we retain that correspondence." },
                { label: "Cookies", desc: "We use cookies to maintain your authentication session. We may also use third-party analytics services that set their own cookies." },
              ],
            },
            {
              title: "How we use your information",
              body: null,
              list: [
                { label: "To operate the site", desc: "Account data is used to authenticate you and personalize your experience." },
                { label: "For research and analysis", desc: "Demographic information you provide may be used — individually or in aggregate — to analyze how different groups of readers interpret political issues. This is core to what TPV does." },
                { label: "To communicate with you", desc: "We may use your email to send service-related notices. We will not send marketing emails without your consent." },
                { label: "To improve the product", desc: "Usage data helps us understand what is and is not working." },
              ],
            },
            {
              title: "How we may share your information",
              body: `We do not sell your personal information. We may share data in the following limited circumstances:`,
              list: [
                { label: "Service providers", desc: "We use third-party services to operate TPV, including Supabase (database and authentication) and Vercel (hosting). These providers access data only as necessary to provide their services." },
                { label: "Research partners", desc: "We may share aggregated, de-identified demographic data with academic institutions, think tanks, or other research organizations. This data cannot be used to identify individual users." },
                { label: "Legal requirements", desc: "We may disclose information if required by law or if we believe disclosure is necessary to protect our rights or comply with legal process." },
                { label: "Business transfers", desc: "If TPV is acquired or merged, your data may transfer to the new entity. We will notify you if this occurs." },
              ],
            },
            {
              title: "Data retention",
              body: `We retain your account information for as long as your account exists. You can delete your account at any time from the account settings page, which will permanently remove your personal data. Anonymized or aggregated data may be retained indefinitely.`,
            },
            {
              title: "Your rights",
              body: `Depending on where you are located, you may have the right to access, correct, or delete the personal information we hold about you. You can update most of your information directly in your account settings. To request deletion of your account and associated data, use the delete account option in settings or contact us at ello.axia@gmail.com.`,
            },
            {
              title: "Children",
              body: `TPV is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, contact us and we will delete it.`,
            },
            {
              title: "Third-party services",
              body: `TPV uses the following third-party services that may collect data independently: Supabase (authentication and data storage), Vercel (hosting and analytics), and Google (OAuth sign-in). Each of these services has its own privacy policy governing their data practices.`,
            },
            {
              title: "Changes to this policy",
              body: `We may update this policy from time to time. The date at the top of this page reflects when it was last revised. Continued use of TPV after changes constitutes acceptance of the updated policy.`,
            },
            {
              title: "Contact",
              body: `Questions about this policy can be sent to ello.axia@gmail.com.`,
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                fontWeight: 400,
                color: "var(--text)",
                letterSpacing: "-0.02em",
                marginBottom: "0.85rem",
              }}>
                {section.title}
              </h2>
              {section.body && (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  color: "var(--text-dim)",
                  marginBottom: section.list ? "0.85rem" : 0,
                }}>
                  {section.body}
                </p>
              )}
              {section.list && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {section.list.map((item) => (
                    <div key={item.label} style={{
                      paddingLeft: "1rem",
                      borderLeft: "2px solid var(--border-light)",
                    }}>
                      <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "0.2rem",
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.88rem",
                        lineHeight: 1.7,
                        color: "var(--text-faint)",
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "2rem" }} />
            </div>
          ))}
        </div>

        {/* Sidebar TOC */}
        <aside style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: "6rem" }}>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>Contents</div>
            <div style={{ display: "grid", gap: "0.1rem" }}>
              {["Who we are", "What we collect", "How we use your information", "How we may share your information", "Data retention", "Your rights", "Children", "Third-party services", "Changes to this policy", "Contact"].map((item) => (
                <div key={item} style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  lineHeight: 1.65,
                  color: "var(--text-faint)",
                  padding: "0.2rem 0",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .privacy-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 980px) {
          .privacy-layout {
            grid-template-columns: 1.5fr 0.5fr;
            gap: 4rem;
          }
        }
      `}</style>
    </main>
  );
}