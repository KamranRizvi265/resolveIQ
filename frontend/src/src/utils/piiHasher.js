/**
 * ResolveIQ Enterprise PII Hashing & Deterministic Pseudonymization Utility
 * Mirrors backend HMAC-SHA256 sanitization pipeline (GDPR Art. 32 / SOC-2 / HIPAA)
 */

function sha256Bytes(bytes) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words = [];
  const asciiBitLength = bytes.length * 8;
  const hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  const copy = bytes.slice();
  copy.push(0x80);
  while (copy.length % 64 !== 56) copy.push(0x00);

  for (let i = 0; i < copy.length; i++) {
    words[i >> 2] |= copy[i] << ((3 - (i % 4)) * 8);
  }

  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice();

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];

      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash.length = 8;
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  const out = [];
  for (let i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      out.push((hash[i] >> (b * 8)) & 255);
    }
  }
  return out;
}

function stringToUtf8Bytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      bytes.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    } else {
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }
  return bytes;
}

export const PII_DEFAULT_KEY = "resolveiq-demo-pii-key-change-in-production";

/**
 * Computes deterministic HMAC-SHA256 hex digest
 */
export function hmacSha256(keyStr, msgStr) {
  let key = stringToUtf8Bytes(keyStr);
  const msg = stringToUtf8Bytes(msgStr);

  if (key.length > 64) {
    key = sha256Bytes(key);
  }
  while (key.length < 64) {
    key.push(0);
  }

  const oKeyPad = key.map((b) => b ^ 0x5c);
  const iKeyPad = key.map((b) => b ^ 0x36);

  const inner = sha256Bytes(iKeyPad.concat(msg));
  const outer = sha256Bytes(oKeyPad.concat(inner));

  return outer.map((b) => (b < 16 ? "0" : "") + b.toString(16)).join("");
}

/**
 * Generates standardized 12-char pseudonym token matching backend: [KIND_abcdef123456]
 */
export function getPiiToken(kind, value, keyStr = PII_DEFAULT_KEY) {
  const digest = hmacSha256(keyStr, value).substring(0, 12);
  return `[${kind}_${digest}]`;
}

// Regex patterns matching backend/src/pii.py
export const PII_PATTERNS = {
  EMAIL: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  PHONE: /(?<!\w)(?:\+?\d[\d().\- ]{7,}\d)(?!\w)/g,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  CARD: /\b(?:\d[ -]?){13,19}\b/g,
  LABELED_ID: /\b(tax[\s_]id|account(?:[\s_]number)?|customer[\s_]id|customer[\s_]name|user[\s_]id)\b(\s*[:=]\s*)([A-Z0-9][A-Z0-9._\/-]{2,})/gi,
};

/**
 * Replaces direct PII identifiers with deterministic HMAC-SHA256 tokens.
 */
export function sanitizeText(text, keyStr = PII_DEFAULT_KEY) {
  if (!text) return "";

  let sanitized = text.replace(PII_PATTERNS.EMAIL, (m) => getPiiToken("EMAIL", m, keyStr));
  sanitized = sanitized.replace(PII_PATTERNS.PHONE, (m) => getPiiToken("PHONE", m, keyStr));
  sanitized = sanitized.replace(PII_PATTERNS.SSN, (m) => getPiiToken("SSN", m, keyStr));
  sanitized = sanitized.replace(PII_PATTERNS.CARD, (m) => getPiiToken("CARD", m, keyStr));
  sanitized = sanitized.replace(PII_PATTERNS.LABELED_ID, (m, label, sep, val) => {
    return `${label}${sep}${getPiiToken("ID", val, keyStr)}`;
  });

  return sanitized;
}

/**
 * Analyzes text for all PII occurrences, extracting entity metadata, positions, and counts
 */
export function analyzePII(text, keyStr = PII_DEFAULT_KEY) {
  if (!text) {
    return {
      rawText: "",
      sanitizedText: "",
      hasPII: false,
      entityCount: 0,
      entities: [],
      entityCounts: { EMAIL: 0, PHONE: 0, SSN: 0, CARD: 0, ID: 0 },
    };
  }

  const entities = [];
  const entityCounts = { EMAIL: 0, PHONE: 0, SSN: 0, CARD: 0, ID: 0 };

  // Emails
  for (const match of text.matchAll(new RegExp(PII_PATTERNS.EMAIL.source, "gi"))) {
    const rawValue = match[0];
    const token = getPiiToken("EMAIL", rawValue, keyStr);
    entities.push({
      kind: "EMAIL",
      label: "Email Address",
      rawValue,
      token,
      index: match.index,
    });
    entityCounts.EMAIL++;
  }

  // Phones
  for (const match of text.matchAll(new RegExp(PII_PATTERNS.PHONE.source, "g"))) {
    const rawValue = match[0];
    const token = getPiiToken("PHONE", rawValue, keyStr);
    entities.push({
      kind: "PHONE",
      label: "Phone Number",
      rawValue,
      token,
      index: match.index,
    });
    entityCounts.PHONE++;
  }

  // SSNs
  for (const match of text.matchAll(new RegExp(PII_PATTERNS.SSN.source, "g"))) {
    const rawValue = match[0];
    const token = getPiiToken("SSN", rawValue, keyStr);
    entities.push({
      kind: "SSN",
      label: "Social Security Number",
      rawValue,
      token,
      index: match.index,
    });
    entityCounts.SSN++;
  }

  // Cards
  for (const match of text.matchAll(new RegExp(PII_PATTERNS.CARD.source, "g"))) {
    const rawValue = match[0];
    const token = getPiiToken("CARD", rawValue, keyStr);
    entities.push({
      kind: "CARD",
      label: "Payment Card Number",
      rawValue,
      token,
      index: match.index,
    });
    entityCounts.CARD++;
  }

  // Labeled IDs
  for (const match of text.matchAll(new RegExp(PII_PATTERNS.LABELED_ID.source, "gi"))) {
    const label = match[1];
    const rawValue = match[3];
    const token = getPiiToken("ID", rawValue, keyStr);
    entities.push({
      kind: "ID",
      label: label.replace(/_/g, " ").toUpperCase(),
      rawValue,
      token,
      index: match.index,
    });
    entityCounts.ID++;
  }

  const sanitizedText = sanitizeText(text, keyStr);

  return {
    rawText: text,
    sanitizedText,
    hasPII: entities.length > 0,
    entityCount: entities.length,
    entities,
    entityCounts,
  };
}

/**
 * Pre-curated incident payloads containing real enterprise sensitive entities
 */
export const PII_DEMO_PRESETS = [
  {
    id: "crm-sync",
    name: "CRM Customer Master Sync",
    badge: "FINOPS-PII-7001",
    severity: "P2-HIGH",
    description: "Actual synthetic incident fixture with customer names, emails, phones, and tax IDs.",
    text: "Synthetic demo record: customer_id=CUST-DEMO-7001 customer_name=Alex-Example (alex.example@example.test, +1-202-555-0147) could not sync because tax_id=TX-DEMO-88421 was already linked to account=ACCT-DEMO-4421.",
  },
  {
    id: "payment-failure",
    name: "Payment Gateway CC & Tax ID",
    badge: "PI-1234",
    severity: "P1-CRITICAL",
    description: "Payment gateway timeout containing credit card PAN number and company tax identifier.",
    text: "Handshake error PI-1234 on payment gateway pod: Failed transaction authorization for customer_name=Marcus-Vance with card=4532 8921 3341 9012 and tax_id=US-EIN-99210 due to socket reset.",
  },
  {
    id: "payroll-hr",
    name: "ITSM HR Payroll Incident",
    badge: "HR-PAYROLL-419",
    severity: "P3-MEDIUM",
    description: "Support ticket containing employee SSN, corporate email, and direct telephone line.",
    text: "Employee compensation sync breach: user_id=EMP-9082 user email sarah.connor@cyberdyne.org reported 401 token issue. Customer contact +1-415-555-2671 and SSN 987-65-4321 failed validation.",
  },
  {
    id: "oms-settlement",
    name: "OMS Webhook Account Leak",
    badge: "OMS-4402",
    severity: "P2-HIGH",
    description: "Order management reconciliation break containing internal account and customer IDs.",
    text: "Webhook notification delivery failed for customer_id=CUST-9921 account_number=ACCT-99201. Customer billing rep email finance.lead@apex-global.com reported unposted ledger break.",
  },
];
