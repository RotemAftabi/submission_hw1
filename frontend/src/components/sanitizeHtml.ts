export function sanitizeHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  const allowedTags = ["b", "i", "u", "img"];
  const allowedAttrs = ["src", "alt"];

  function sanitizeNode(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.replaceWith(...Array.from(el.childNodes));
        return;
      }

      for (const attr of Array.from(el.attributes)) {
        if (!allowedAttrs.includes(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      }
    }

    node.childNodes.forEach(sanitizeNode);
  }

  doc.body.childNodes.forEach(sanitizeNode);
  return doc.body.innerHTML;
}
