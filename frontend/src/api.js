export const BASE_URL = import.meta.env.DEV
  ? 'https://ubigeo-api.angelmarcoscastilla15.workers.dev'
  : window.location.origin;

export function highlightJson(json) {
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'tok-num';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'tok-key' : 'tok-str';
      else if (/true|false|null/.test(match)) cls = 'tok-bool';
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
