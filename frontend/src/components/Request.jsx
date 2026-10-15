import React, { useEffect, useMemo, useState } from 'react';
import { highlightJson } from '../api';

const fmtSize = (n) => (n > 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`);
const json = (o) => JSON.stringify(o, null, 2);

function Code({ text, highlight }) {
  return highlight ? (
    <pre className="code" dangerouslySetInnerHTML={{ __html: highlightJson(text) }} />
  ) : (
    <pre className="code">{text}</pre>
  );
}

function CopyButton({ text, label = 'Copiar' }) {
  const [done, setDone] = useState(false);
  const click = async () => {
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };
  return (
    <button className="btn-ghost" onClick={click}>
      {done ? '✓ Copiado' : label}
    </button>
  );
}

export default function Request({ endpoint, baseUrl }) {
  const { param } = endpoint;
  const [id, setId] = useState(param ? param.samples[0] : '');
  const [tab, setTab] = useState('result');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const path = param ? endpoint.path.replace(':id', id || ':id') : endpoint.path;
  const url = baseUrl + path;
  const ready = !param || id.length > 0;

  const send = async () => {
    if (!ready || loading) return;
    setTab('result');
    setLoading(true);
    setError(null);
    setResult(null);
    const t0 = performance.now();
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResult({
        status: res.status,
        ok: res.ok,
        time: Math.round(performance.now() - t0),
        size: new Blob([JSON.stringify(data)]).size,
        remaining: res.headers.get('X-RateLimit-Remaining'),
        limit: res.headers.get('X-RateLimit-Limit'),
        data,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') send();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const body = useMemo(() => (result ? json(result.data) : ''), [result]);
  const items = result && Object.values(result.data).find(Array.isArray);

  const snippets = {
    cURL: `curl "${url}"`,
    JavaScript: `const res = await fetch("${url}");\nconst data = await res.json();\nconsole.log(data);`,
    Python: `import requests\n\nres = requests.get("${url}")\nprint(res.json())`,
  };
  const [lang, setLang] = useState('cURL');

  return (
    <div className="request">
      <header className="request__head">
        <h1>{endpoint.title}</h1>
        <p>{endpoint.description}</p>
      </header>

      <div className="urlbar">
        <span className="method method--lg">GET</span>
        <div className="urlbar__url" title={url}>
          <span className="urlbar__base">{baseUrl}</span>
          {endpoint.path.split(':id').map((part, i, arr) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < arr.length - 1 && <span className="urlbar__param">{id || ':id'}</span>}
            </React.Fragment>
          ))}
        </div>
        <button className="btn-primary" onClick={send} disabled={!ready || loading}>
          {loading ? <span className="spinner" /> : 'Enviar'}
        </button>
      </div>

      {param && (
        <div className="params">
          <label htmlFor="param-id">
            <code>id</code> · {param.label} ({param.digits} dígitos)
          </label>
          <input
            id="param-id"
            value={id}
            maxLength={6}
            inputMode="numeric"
            placeholder={`ej: ${param.samples[0]}`}
            onChange={(e) => setId(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          {param.samples.map((s) => (
            <button key={s} className={`chip ${id === s ? 'is-active' : ''}`} onClick={() => setId(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="tabs">
        <button className={tab === 'result' ? 'is-active' : ''} onClick={() => setTab('result')}>
          Resultado
        </button>
        <button className={tab === 'docs' ? 'is-active' : ''} onClick={() => setTab('docs')}>
          Documentación
        </button>
        <span className="tabs__hint">Ctrl + Enter para enviar</span>
      </div>

      {tab === 'result' && (
        <section className="panel">
          {error && <div className="alert">⚠️ {error}</div>}
          {loading && <div className="empty">Enviando petición…</div>}
          {!result && !loading && !error && (
            <div className="empty">
              <div className="empty__icon">⏎</div>
              Pulsa <strong>Enviar</strong> para ver la respuesta
            </div>
          )}
          {result && (
            <>
              <div className="meta">
                <span className={`pill ${result.ok ? 'pill--ok' : 'pill--err'}`}>{result.status}</span>
                <span className="pill">{result.time} ms</span>
                <span className="pill">{fmtSize(result.size)}</span>
                {items && <span className="pill">{items.length} registros</span>}
                {result.limit && (
                  <span className="pill">
                    {result.remaining}/{result.limit} req
                  </span>
                )}
                <span className="meta__spacer" />
                <CopyButton text={body} />
              </div>
              {body.length < 400000 ? <Code text={body} highlight /> : <Code text={body} />}
            </>
          )}
        </section>
      )}

      {tab === 'docs' && (
        <section className="panel docs">
          <h3>Endpoint</h3>
          <p>
            <span className="method">GET</span> <code>{endpoint.path}</code>
          </p>

          <h3>Parámetros de ruta</h3>
          {param ? (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>id</code>
                  </td>
                  <td>string</td>
                  <td>
                    {param.description} Ej: <code>{param.samples[0]}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="muted">Este endpoint no recibe parámetros.</p>
          )}

          <h3>Respuesta 200</h3>
          <Code text={json(endpoint.response)} highlight />

          <h3>Errores</h3>
          <table>
            <tbody>
              {endpoint.notFound && (
                <tr>
                  <td>
                    <code>404</code>
                  </td>
                  <td>
                    {endpoint.notFound} no encontrado o código con formato inválido.
                  </td>
                </tr>
              )}
              <tr>
                <td>
                  <code>429</code>
                </td>
                <td>Límite de 100 peticiones por minuto excedido.</td>
              </tr>
            </tbody>
          </table>

          <h3>Ejemplo de uso</h3>
          <div className="snippet-tabs">
            {Object.keys(snippets).map((l) => (
              <button key={l} className={lang === l ? 'is-active' : ''} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
            <span className="meta__spacer" />
            <CopyButton text={snippets[lang]} />
          </div>
          <Code text={snippets[lang]} />
        </section>
      )}
    </div>
  );
}
