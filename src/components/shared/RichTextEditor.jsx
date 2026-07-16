import { useEffect, useMemo, useRef, useState } from "react";
import { sanitizeRichTextHtml } from "../../utils/richText";

function getPlainTextFromHtml(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html || "";
  return (temp.textContent || temp.innerText || "")
    .replace(/\u00A0/g, " ")
    .trim();
}

function sanitizeHref(url) {
  const value = String(url || "").trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:")
  ) {
    return value;
  }

  return `https://${value}`;
}

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Escribe aquí...",
  invalid = false,
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const isFocusedRef = useRef(false);

  const [htmlMode, setHtmlMode] = useState(false);
  const [textCounter, setTextCounter] = useState("");

  const safeValue = useMemo(() => sanitizeRichTextHtml(value), [value]);

  useEffect(() => {
    if (!editorRef.current || htmlMode) return;

    if (isFocusedRef.current) return;

    const current = editorRef.current.innerHTML;

    if (current !== safeValue) {
      editorRef.current.innerHTML = safeValue || "";
      setTextCounter(getPlainTextFromHtml(safeValue));
    }
  }, [safeValue, htmlMode]);

  function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

    savedRangeRef.current = range.cloneRange();
  }

  function restoreSelection() {
    const selection = window.getSelection();

    if (!selection) return;

    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    } else {
      editorRef.current?.focus();
    }
  }

  function emitRawChange() {
    const html = editorRef.current?.innerHTML || "";
    setTextCounter(getPlainTextFromHtml(html));
    onChange?.(html);
  }

  function emitSanitizedChange() {
    if (!editorRef.current) return;

    const normalized = sanitizeRichTextHtml(editorRef.current.innerHTML);

    editorRef.current.innerHTML = normalized;
    setTextCounter(getPlainTextFromHtml(normalized));
    onChange?.(normalized);
  }

  function exec(command, commandValue = null) {
    restoreSelection();
    editorRef.current?.focus();

    document.execCommand(command, false, commandValue);

    emitRawChange();
    saveSelection();
  }

  function applyBlock(tag) {
    exec("formatBlock", tag);
  }

  function insertLink() {
    restoreSelection();

    const selectedText = window.getSelection()?.toString()?.trim() || "";

    const url = window.prompt(
      "Ingresa la URL del enlace:",
      selectedText.startsWith("http") ? selectedText : "https://"
    );

    if (!url) return;

    const safeHref = sanitizeHref(url);

    if (!safeHref) return;

    exec("createLink", safeHref);
  }

  function clearFormatting() {
    restoreSelection();
    editorRef.current?.focus();

    document.execCommand("removeFormat", false, null);
    document.execCommand("unlink", false, null);

    emitRawChange();
    saveSelection();
  }

  function handleInput() {
    emitRawChange();
    saveSelection();
  }

  function handleFocus() {
    isFocusedRef.current = true;
  }

  function handleBlur() {
    isFocusedRef.current = false;
    emitSanitizedChange();
    saveSelection();
  }

  function handleHtmlChange(e) {
    const normalized = sanitizeRichTextHtml(e.target.value);
    setTextCounter(getPlainTextFromHtml(normalized));
    onChange?.(normalized);
  }

  function toggleHtmlMode() {
    if (!htmlMode) {
      emitSanitizedChange();
    }

    setHtmlMode((prev) => !prev);
  }

  const plainText = htmlMode ? getPlainTextFromHtml(safeValue) : textCounter;

  return (
    <div className={`rte ${invalid ? "is-invalid" : ""}`}>
      <div className="rte__toolbar">
        <div className="rte__group">
          <button
            type="button"
            className="rte__block-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyBlock("p")}
          >
            Párrafo
          </button>

          <button
            type="button"
            className="rte__block-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyBlock("h2")}
          >
            Título
          </button>

          <button
            type="button"
            className="rte__block-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyBlock("h3")}
          >
            Subtítulo
          </button>
        </div>

        <div className="rte__group">
          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("bold")}
            title="Negrita"
            aria-label="Negrita"
          >
            <i className="bi bi-type-bold"></i>
          </button>

          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("italic")}
            title="Cursiva"
            aria-label="Cursiva"
          >
            <i className="bi bi-type-italic"></i>
          </button>

          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertUnorderedList")}
            title="Lista con viñetas"
            aria-label="Lista con viñetas"
          >
            <i className="bi bi-list-ul"></i>
          </button>

          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertOrderedList")}
            title="Lista numerada"
            aria-label="Lista numerada"
          >
            <i className="bi bi-list-ol"></i>
          </button>

          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertLink}
            title="Insertar enlace"
            aria-label="Insertar enlace"
          >
            <i className="bi bi-link-45deg"></i>
          </button>

          <button
            type="button"
            className="rte__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearFormatting}
            title="Quitar formato"
            aria-label="Quitar formato"
          >
            <i className="bi bi-eraser"></i>
          </button>
        </div>

        <div className="rte__group rte__group--right">
          <button
            type="button"
            className={`rte__toggle ${htmlMode ? "is-active" : ""}`}
            onClick={toggleHtmlMode}
          >
            {htmlMode ? "Vista visual" : "HTML"}
          </button>
        </div>
      </div>

      {!htmlMode ? (
        <div
          id={id}
          ref={editorRef}
          className="rte__editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          role="textbox"
          aria-multiline="true"
        />
      ) : (
        <textarea
          className="rte__source"
          value={safeValue}
          onChange={handleHtmlChange}
          placeholder="HTML de la descripción"
        />
      )}

      <div className="rte__footer">
        <span>
          {plainText
            ? `${plainText.length} caracteres de texto`
            : "Sin contenido"}
        </span>
      </div>
    </div>
  );
}