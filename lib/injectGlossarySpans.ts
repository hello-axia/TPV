// lib/injectGlossarySpans.ts
//
// Injects glossary tooltip spans into an HTML string at build time.
// Runs in getStaticProps — avoids React virtual DOM reconciliation fights.
//
// Rules:
//  - Replaces the first MAX_OCCURRENCES occurrences of each term
//  - Never replaces inside HTML tag attributes
//  - Never replaces inside an existing .tpv-gloss-term span
//  - Never replaces inside an existing .tpv-gloss-tooltip span (definition text)
//  - Never replaces inside the .tpv-glossary section at the bottom
//  - Never replaces inside headings (h1–h4)

const MAX_OCCURRENCES = 2;

export type GlossaryEntry = {
  term: string;
  definition: string;
};

function buildTooltip(term: string, definition: string, anchorId: string): string {
  return (
    `<span class="tpv-gloss-term" tabindex="0">` +
    `%%MATCH%%` +
    `<span class="tpv-gloss-tooltip">` +
    `<span class="tpv-gloss-tooltip-term">${term}</span>` +
    `<span class="tpv-gloss-tooltip-def">${definition}</span>` +
    `<a class="tpv-gloss-tooltip-link" href="#${anchorId}">See full definition ↓</a>` +
    `</span>` +
    `</span>`
  );
}

export function injectGlossarySpans(
  html: string,
  glossary: GlossaryEntry[]
): string {
  if (!glossary || glossary.length === 0) return html;

  for (const { term, definition } of glossary) {
    const anchorId = `gloss-${term.toLowerCase().replace(/\s+/g, "-")}`;
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const termRegex = new RegExp(`\\b${escapedTerm}\\b`, "i");

    // Split the HTML into alternating [text, tag, text, tag, ...] segments.
    // Even indices = text content. Odd indices = HTML tags.
    const segments = html.split(/(<[^>]+>)/);

    let depth = {
      glossTerm: 0,    // inside tpv-gloss-term span
      glossTooltip: 0, // inside tpv-gloss-tooltip span (definition content) — exact class only
      glossary: 0,     // inside tpv-glossary div
      heading: 0,      // inside h1–h4
    };

    let count = 0; // how many times we've injected this term so far

    const output = segments.map((seg, i) => {
      if (i % 2 === 1) {
        // HTML tag — update depth tracking
        const isClosing = seg.startsWith("</");
        const tag = seg.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase() ?? "";

        if (!isClosing) {
          if (/tpv-gloss-term/.test(seg))    depth.glossTerm++;
          // Only match exact tooltip container — "tpv-gloss-tooltip" followed by " or ' or space
          // This excludes tpv-gloss-tooltip-term, tpv-gloss-tooltip-def, tpv-gloss-tooltip-link
          if (/tpv-gloss-tooltip["' ]/.test(seg)) depth.glossTooltip++;
          if (/tpv-glossary|tpv-sources/.test(seg))      depth.glossary++;
          if (/^h[1-4]$/.test(tag))          depth.heading++;
        } else {
          // Mutually exclusive: one </span> decrements only one counter
          if (tag === "span" && depth.glossTooltip > 0) {
            depth.glossTooltip--;
          } else if (tag === "span" && depth.glossTerm > 0) {
            depth.glossTerm--;
          }
          if ((tag === "div" || tag === "section") && depth.glossary > 0) depth.glossary--;
          if (/^h[1-4]$/.test(tag) && depth.heading > 0) depth.heading--;
        }
        return seg;
      }

      // Text segment — skip if we've hit the max, or inside a protected zone
      if (count >= MAX_OCCURRENCES) return seg;
      if (
        depth.glossTerm > 0    ||
        depth.glossTooltip > 0 ||
        depth.glossary > 0     ||
        depth.heading > 0
      ) return seg;
      if (!termRegex.test(seg)) return seg;

      // Replace first occurrence in this text segment only, then increment count
      count++;
      const tooltip = buildTooltip(term, definition, anchorId);
      return seg.replace(termRegex, (match) => tooltip.replace("%%MATCH%%", match));
    });

    html = output.join("");
  }

  return html;
}