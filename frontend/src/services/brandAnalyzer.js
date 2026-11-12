
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractTerms = (text) => {
  const terms = [];
  const patterns = [
    /["“]([^"”]+)["”]/g,
    /(?:avoid|prohibited|do not use|don't use|never use)\s+(?:the phrase\s+)?["“]?([^,.;\n"”]+)["”]?/gi,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1].trim();
      if (term.length > 2) terms.push(term);
    }
  });

  return [...new Set(terms)];
};

const findReplacement = (text, term) => {
  const patterns = [
    new RegExp(
      `(?:use|replace with|say)\\s+["“]?([^,"”.;\\n]+)["”]?\\s+(?:instead of|rather than)\\s+["“]?${escapeRegex(term)}["”]?`,
      'i'
    ),
    new RegExp(
      `${escapeRegex(term)}\\s+(?:should be replaced with|should become)\\s+["“]?([^,"”.;\\n]+)`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
};

export function analyzeBrandContent(content, guidelines) {
  const findings = [];
  const normalizedContent = content.toLowerCase();

  guidelines
    .filter((guideline) => guideline.status === 'active')
    .forEach((guideline) => {
      const rule = `${guideline.title}. ${guideline.content}`;
      const category = guideline.category;

      if (category === 'prohibited_claim') {
        const terms = extractTerms(rule);

        terms.forEach((term) => {
          if (normalizedContent.includes(term.toLowerCase())) {
            const replacement = findReplacement(rule, term);

            findings.push({
              id: crypto.randomUUID(),
              severity: 'high',
              category: 'Prohibited claim or phrase',
              message: `The phrase "${term}" appears in the submitted content.`,
              guideline: guideline.title,
              guidelineId: guideline.id,
              evidence: guideline.content,
              matchedText: term,
              suggestion: replacement
                ? `Replace "${term}" with "${replacement}".`
                : `Review and replace "${term}" with wording permitted by this guideline.`,
              replacement,
            });
          }
        });

        if (
          terms.length === 0 &&
          /guarantee|guaranteed|claim|promise|absolute|unverified/i.test(rule)
        ) {
          const risky = normalizedContent.match(
            /\b(guaranteed?|100%|risk[- ]free|no\.? 1|number one|best ever|cure[s]?|instant results)\b/gi
          );

          if (risky) {
            findings.push({
              id: crypto.randomUUID(),
              severity: 'high',
              category: 'Potentially unsupported claim',
              message: `Potentially risky wording detected: ${[...new Set(risky)].join(', ')}.`,
              guideline: guideline.title,
              guidelineId: guideline.id,
              evidence: guideline.content,
              matchedText: [...new Set(risky)].join(', '),
              suggestion: 'Verify the claim with an approved source or use more qualified wording.',
            });
          }
        }
      }

      if (category === 'terminology') {
        const terms = extractTerms(rule);

        terms.forEach((term) => {
          if (normalizedContent.includes(term.toLowerCase())) {
            const replacement = findReplacement(rule, term);

            findings.push({
              id: crypto.randomUUID(),
              severity: 'medium',
              category: 'Terminology inconsistency',
              message: `The term "${term}" may not follow approved brand terminology.`,
              guideline: guideline.title,
              guidelineId: guideline.id,
              evidence: guideline.content,
              matchedText: term,
              suggestion: replacement
                ? `Use "${replacement}" instead.`
                : 'Replace this term with the approved terminology specified by your brand team.',
              replacement,
            });
          }
        });
      }

      if (category === 'voice_tone') {
        const upperWords = content.match(/\b[A-Z]{4,}\b/g) || [];
        const exclamations = (content.match(/!/g) || []).length;
        const asksForFormal = /formal|professional|calm|respectful/i.test(rule);
        const asksForFriendly = /friendly|conversational|approachable/i.test(rule);

        if (
          (asksForFormal && (upperWords.length >= 2 || exclamations >= 3)) ||
          (asksForFriendly && /\b(therefore|herewith|aforementioned)\b/i.test(content))
        ) {
          findings.push({
            id: crypto.randomUUID(),
            severity: 'medium',
            category: 'Tone mismatch',
            message: 'Some wording may not align with the requested brand voice.',
            guideline: guideline.title,
            guidelineId: guideline.id,
            evidence: guideline.content,
            matchedText: upperWords.slice(0, 4).join(', ') || 'Formal wording or excessive punctuation',
            suggestion: 'Adjust the wording to better reflect the tone described in this guideline.',
          });
        }
      }

      if (category === 'accessibility') {
        const longSentences = content
          .split(/[.!?]+/)
          .filter((sentence) => sentence.trim().split(/\s+/).length > 35);

        if (longSentences.length > 0) {
          findings.push({
            id: crypto.randomUUID(),
            severity: 'low',
            category: 'Accessibility and readability',
            message: `${longSentences.length} sentence(s) are longer than 35 words.`,
            guideline: guideline.title,
            guidelineId: guideline.id,
            evidence: guideline.content,
            matchedText: longSentences[0].trim(),
            suggestion: 'Break long sentences into shorter, clearer statements.',
          });
        }
      }

      if (category === 'approved_fact') {
        const numbers = content.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
        const approvedNumbers = guideline.content.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
        const unverifiedNumbers = numbers.filter(
          (number) => !approvedNumbers.includes(number)
        );

        if (unverifiedNumbers.length > 0) {
          findings.push({
            id: crypto.randomUUID(),
            severity: 'high',
            category: 'Fact verification',
            message: `The content includes numeric claim(s) not found in this approved fact: ${unverifiedNumbers.join(', ')}.`,
            guideline: guideline.title,
            guidelineId: guideline.id,
            evidence: guideline.content,
            matchedText: unverifiedNumbers.join(', '),
            suggestion: 'Verify these figures against an approved source before publication.',
          });
        }
      }
    });

  const uniqueFindings = findings.filter(
    (finding, index, self) =>
      index === self.findIndex((item) =>
        item.guidelineId === finding.guidelineId &&
        item.matchedText === finding.matchedText &&
        item.category === finding.category
      )
  );

  const high = uniqueFindings.filter((item) => item.severity === 'high').length;
  const medium = uniqueFindings.filter((item) => item.severity === 'medium').length;
  const low = uniqueFindings.filter((item) => item.severity === 'low').length;

  return {
    findings: uniqueFindings,
    summary: uniqueFindings.length === 0
      ? 'No issues were detected by the current guideline checks. Human review is still recommended.'
      : `${uniqueFindings.length} issue(s) detected: ${high} high, ${medium} medium and ${low} low severity.`,
    suggestedContent: uniqueFindings.reduce((text, finding) => {
      if (!finding.replacement || !finding.matchedText) return text;

      return text.replace(
        new RegExp(escapeRegex(finding.matchedText), 'gi'),
        finding.replacement
      );
    }, content),
  };
}