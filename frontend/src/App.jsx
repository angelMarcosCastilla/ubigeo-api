import React, { useState } from 'react';
import './App.css';
import { GROUPS, ENDPOINTS } from './endpoints';
import { BASE_URL } from './api';
import Request from './components/Request';

const initialTheme = () =>
  localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [selected, setSelected] = useState(ENDPOINTS[2]);
  const [query, setQuery] = useState('');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  const q = query.trim().toLowerCase();
  const matches = (e) => !q || e.path.includes(q) || e.title.toLowerCase().includes(q);

  return (
    <div className={`app app--${theme}`}>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="logo">◎</span>
          <div>
            <div className="sidebar__name">UBIGEO API</div>
            <div className="sidebar__sub">Perú · v1</div>
          </div>
          <button className="icon-btn" onClick={toggleTheme} title="Cambiar tema" aria-label="Cambiar tema">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <input
          className="sidebar__search"
          placeholder="Buscar endpoint…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav className="sidebar__list">
          {GROUPS.map((g) => {
            const items = ENDPOINTS.filter((e) => e.group === g.id && matches(e));
            if (!items.length) return null;
            return (
              <div key={g.id} className="sidebar__group">
                <div className="sidebar__group-title">{g.label}</div>
                {items.map((e) => (
                  <button
                    key={e.path}
                    className={`sidebar__item ${selected.path === e.path ? 'is-active' : ''}`}
                    onClick={() => setSelected(e)}
                  >
                    <span className="method">GET</span>
                    <span className="sidebar__path">{e.path.replace('/api', '')}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar__foot">
          <span className="dot" /> CORS abierto · 100 req/min
        </div>
      </aside>

      <main className="workspace">
        <Request key={selected.path} endpoint={selected} baseUrl={BASE_URL} />
      </main>
    </div>
  );
}
