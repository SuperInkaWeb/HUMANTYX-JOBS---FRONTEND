const ALLOWED_TAGS = new Set([
  "P",
  "H2",
  "H3",
  "STRONG",
  "B",
  "EM",
  "I",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "A",
  "BR",
]);

function normalizeSpaces(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ");
}

function escapeHtml(text) {
  return normalizeSpaces(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isHtmlString(value) {
  return /<([a-z][a-z0-9]*)\b[^>]*>/i.test(String(value || ""));
}

function convertPlainTextToHtml(text) {
  const clean = normalizeSpaces(text).replace(/\r/g, "").trim();
  if (!clean) return "";

  const paragraphs = clean
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`);

  return paragraphs.join("");
}

function sanitizeHref(href) {
  const value = String(href || "").trim();
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("#")
  ) {
    return value;
  }

  return "";
}

function cleanNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(normalizeSpaces(node.textContent || ""));
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName.toUpperCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();

    Array.from(node.childNodes).forEach((child) => {
      const cleanedChild = cleanNode(child, doc);
      if (cleanedChild) fragment.appendChild(cleanedChild);
    });

    return fragment;
  }

  const el = doc.createElement(tag.toLowerCase());

  if (tag === "A") {
    const safeHref = sanitizeHref(node.getAttribute("href"));
    if (safeHref) {
      el.setAttribute("href", safeHref);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  }

  Array.from(node.childNodes).forEach((child) => {
    const cleanedChild = cleanNode(child, doc);
    if (cleanedChild) el.appendChild(cleanedChild);
  });

  return el;
}

function wrapStrayNodesIntoParagraphs(root, doc) {
  const nextChildren = [];
  let paragraphBuffer = null;

  function flushParagraphBuffer() {
    if (!paragraphBuffer) return;

    const text = normalizeSpaces(paragraphBuffer.textContent).trim();

    if (text) {
      nextChildren.push(paragraphBuffer);
    }

    paragraphBuffer = null;
  }

  Array.from(root.childNodes).forEach((node) => {
    const isBlock =
      node.nodeType === Node.ELEMENT_NODE &&
      ["P", "H2", "H3", "UL", "OL", "BLOCKQUOTE"].includes(
        node.tagName.toUpperCase()
      );

    if (isBlock) {
      flushParagraphBuffer();
      nextChildren.push(node);
      return;
    }

    const text = normalizeSpaces(node.textContent);

    if (!text.trim()) return;

    if (!paragraphBuffer) {
      paragraphBuffer = doc.createElement("p");
    }

    paragraphBuffer.appendChild(node.cloneNode(true));
  });

  flushParagraphBuffer();

  root.innerHTML = "";
  nextChildren.forEach((child) => root.appendChild(child));
}

function removeEmptyNodes(root) {
  Array.from(root.querySelectorAll("p,h2,h3,blockquote,li")).forEach((el) => {
    const text = normalizeSpaces(el.textContent).trim();
    const hasBr = el.querySelector("br");

    if (!text && !hasBr) {
      el.remove();
    }
  });
}

function normalizeOutputHtml(html) {
  return String(html || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+<\/p>/g, "</p>")
    .trim();
}

export function sanitizeRichTextHtml(input) {
  const raw = normalizeSpaces(input).trim();
  if (!raw) return "";

  if (!isHtmlString(raw)) {
    return convertPlainTextToHtml(raw);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="root">${raw}</div>`, "text/html");
  const sourceRoot = doc.getElementById("root");
  const cleanRoot = doc.createElement("div");

  Array.from(sourceRoot.childNodes).forEach((node) => {
    const cleaned = cleanNode(node, doc);
    if (cleaned) cleanRoot.appendChild(cleaned);
  });

  wrapStrayNodesIntoParagraphs(cleanRoot, doc);
  removeEmptyNodes(cleanRoot);

  return normalizeOutputHtml(cleanRoot.innerHTML);
}