export default function TermsPage() {
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
          Terms of Service
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

      <div className="terms-layout fade-up-delay-1">
        <div style={{ minWidth: 0 }}>

          {[
            {
              title: "Acceptance of terms",
              body: `By accessing or using tpverdict.com ("TPV", "the site"), you agree to be bound by these Terms of Service. If you do not agree, do not use the site. We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.`,
            },
            {
              title: "What TPV is",
              body: `TPV is a political analysis publication. All content is intended for informational and educational purposes only. Nothing published on TPV constitutes legal, financial, or professional advice of any kind. Poll results and reader opinions expressed on the site reflect the views of participants, not TPV as an organization.`,
            },
            {
              title: "Your account",
              body: null,
              list: [
                { label: "Eligibility", desc: "You must be at least 13 years old to create an account. By registering, you represent that you meet this requirement." },
                { label: "Accuracy", desc: "You agree to provide accurate information when creating your account. You are responsible for keeping your account information current." },
                { label: "Security", desc: "You are responsible for maintaining the security of your account. Notify us immediately at ello.axia@gmail.com if you suspect unauthorized access." },
                { label: "Termination", desc: "We reserve the right to suspend or terminate accounts that violate these terms or that we determine, in our sole discretion, are being used in harmful or abusive ways." },
              ],
            },
            {
              title: "Acceptable use",
              body: `You agree not to use TPV to:`,
              list: [
                { label: "Interfere with the site", desc: "Attempt to disrupt, overload, or compromise the security or integrity of TPV or its underlying infrastructure." },
                { label: "Scrape or harvest data", desc: "Use automated tools to extract content or data from the site without our express written permission." },
                { label: "Misrepresent yourself", desc: "Impersonate another person or entity, or submit false demographic information with the intent to manipulate poll results or research data." },
                { label: "Distribute harmful content", desc: "Use the contact form or any other feature to send spam, malware, or content that is illegal, threatening, or abusive." },
              ],
            },
            {
              title: "Content and intellectual property",
              body: `All editorial content published on TPV, including articles, analyses, and structural formats, is owned by TPV and protected by copyright. You may share links to TPV content and quote brief excerpts for commentary or educational purposes, provided you attribute TPV and link to the original. Reproduction of full articles or systematic copying of content without written permission is prohibited.`,
            },
            {
              title: "User-submitted content",
              body: `When you submit content through TPV, including poll responses, contact form messages, or profile information, you grant TPV a non-exclusive, royalty-free license to use, store, and analyze that content for the purposes described in our Privacy Policy. You retain ownership of anything you submit. You represent that you have the right to submit it and that it does not violate any third-party rights.`,
            },
            {
              title: "Research and data use",
              body: `By creating an account and providing demographic information, you acknowledge that TPV may use anonymized and aggregated data for research purposes, including sharing with academic institutions, think tanks, and other organizations. Individual responses are never attributed to you personally in any external publication or report. See our Privacy Policy for more detail.`,
            },
            {
              title: "Disclaimers",
              body: `TPV is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the site will be available at all times, that content will be error-free, or that poll results are statistically representative of any broader population. Political analysis involves interpretation and judgment. Reasonable people disagree. Nothing on TPV should be taken as the definitive or authoritative view on any issue.`,
            },
            {
              title: "Limitation of liability",
              body: `To the fullest extent permitted by law, TPV and its operators will not be liable for any indirect, incidental, or consequential damages arising from your use of the site, including loss of data, loss of revenue, or any harm resulting from reliance on content published on TPV.`,
            },
            {
              title: "Governing law",
              body: `These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes arising from these terms or your use of TPV will be resolved in the courts of California.`,
            },
            {
              title: "Contact",
              body: `Questions about these terms can be sent to ello.axia@gmail.com.`,
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
                  color: "#d4cec8",
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
              {[
                "Acceptance of terms",
                "What TPV is",
                "Your account",
                "Acceptable use",
                "Content and intellectual property",
                "User-submitted content",
                "Research and data use",
                "Disclaimers",
                "Limitation of liability",
                "Governing law",
                "Contact",
              ].map((item) => (
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
        .terms-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 980px) {
          .terms-layout {
            grid-template-columns: 1.5fr 0.5fr;
            gap: 4rem;
          }
        }
      `}</style>
    </main>
  );
}