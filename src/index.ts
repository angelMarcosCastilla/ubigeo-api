import { Hono } from 'hono';
import { cors } from 'hono/cors';
import distritos from './data/distritos.json';
import provincias from './data/provincias.json';
import departamentos from './data/departamentos.json';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  })
);

// Rate Limiting Middleware
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60000;

// Rate limiting middleware for API routes
const rateLimitMiddleware = async (c: any, next: any) => {
  // Only apply to /api routes
  if (!c.req.path.startsWith('/api')) {
    return next();
  }

  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const now = Date.now();

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }

  const userData = rateLimitStore[ip];

  if (now > userData.resetTime) {
    userData.count = 0;
    userData.resetTime = now + RATE_LIMIT_WINDOW;
  }

  userData.count++;

  c.res.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
  c.res.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - userData.count).toString());
  c.res.headers.set('X-RateLimit-Reset', userData.resetTime.toString());

  if (userData.count > RATE_LIMIT) {
    c.status(429);
    return c.json({ error: 'Too many requests. Rate limit exceeded.' });
  }

  return next();
};

app.use('*', rateLimitMiddleware);

// Codes are 6 digits: DDPPTT (departamento, provincia, distrito).
// Shorter ids (e.g. "01", "0101") are padded with zeros.
// Each level accepts its short code (2/4/6 digits) or the full 6-digit code.
const findByCode = (list: any[], id: string) => {
  const digits = list === departamentos ? 2 : list === provincias ? 4 : 6;
  if (!/^\d+$/.test(id) || (id.length !== digits && id.length !== 6)) return undefined;
  return list.find((x) => x.reniec === id.padEnd(6, '0'));
};
const invalidId = (id: string) => !/^\d{2}(\d{2})?(\d{2})?$/.test(id);

const notFound = (c: any, what: string) => {
  c.status(404);
  return c.json({ error: `${what} not found` });
};

// API Endpoints

// Departamentos
app.get('/api/departamentos', async (c) => {
  return c.json({
    departamentos: departamentos,
  });
});

app.get('/api/departamentos/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    c.status(400);
    return c.json({
      error: 'No id provided',
    });
  }

  const departamento = findByCode(departamentos, id);

  if (!departamento) {
    c.status(404);
    return c.json({
      error: 'Departamento not found',
    });
  }

  return c.json({
    departamento: departamento,
  });
});

// Provincias
app.get('/api/provincias', async (c) => {
  return c.json({
    provincias: provincias,
  });
});

app.get('/api/provincias/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    c.status(400);
    return c.json({
      error: 'No id provided',
    });
  }

  const provincia = findByCode(provincias, id);

  if (!provincia) {
    c.status(404);
    return c.json({
      error: 'Provincia not found',
    });
  }

  return c.json({
    provincia: provincia,
  });
});

// Distritos
app.get('/api/distritos', async (c) => {
  return c.json({
    distritos: distritos,
  });
});

app.get('/api/distritos/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    c.status(400);
    return c.json({
      error: 'No id provided',
    });
  }

  const distrito = findByCode(distritos, id);

  if (!distrito) {
    c.status(404);
    return c.json({
      error: 'Distrito not found',
    });
  }

  return c.json({
    distrito: distrito,
  });
});

// Nested relationsb
app.get('/api/departamentos/:id/provincias', (c) => {
  const id = c.req.param('id');
  const departamento = invalidId(id) ? undefined : findByCode(departamentos, id);
  if (!departamento) return notFound(c, 'Departamento');
  const prefix = departamento.reniec.slice(0, 2);
  return c.json({
    departamento,
    provincias: provincias.filter((p: any) => p.reniec.startsWith(prefix)),
  });
});

app.get('/api/departamentos/:id/distritos', (c) => {
  const id = c.req.param('id');
  const departamento = invalidId(id) ? undefined : findByCode(departamentos, id);
  if (!departamento) return notFound(c, 'Departamento');
  const prefix = departamento.reniec.slice(0, 2);
  return c.json({
    departamento,
    distritos: distritos.filter((d: any) => d.reniec?.startsWith(prefix)),
  });
});

app.get('/api/provincias/:id/departamento', (c) => {
  const id = c.req.param('id');
  const provincia = invalidId(id) ? undefined : findByCode(provincias, id);
  if (!provincia) return notFound(c, 'Provincia');
  const departamento = departamentos.find(
    (d: any) => d.reniec.slice(0, 2) === provincia.reniec.slice(0, 2)
  );
  if (!departamento) return notFound(c, 'Departamento');
  return c.json({ provincia, departamento });
});

app.get('/api/provincias/:id/distritos', (c) => {
  const id = c.req.param('id');
  const provincia = invalidId(id) ? undefined : findByCode(provincias, id);
  if (!provincia) return notFound(c, 'Provincia');
  const prefix = provincia.reniec.slice(0, 4);
  return c.json({
    provincia,
    distritos: distritos.filter((d: any) => d.reniec?.startsWith(prefix)),
  });
});

app.get('/api/distritos/:id/provincia', (c) => {
  const id = c.req.param('id');
  const distrito = invalidId(id) ? undefined : findByCode(distritos, id);
  if (!distrito) return notFound(c, 'Distrito');
  const provincia = provincias.find(
    (p: any) => p.reniec.slice(0, 4) === distrito.reniec.slice(0, 4)
  );
  if (!provincia) return notFound(c, 'Provincia');
  return c.json({ distrito, provincia });
});

app.get('/api/distritos/:id/departamento', (c) => {
  const id = c.req.param('id');
  const distrito = invalidId(id) ? undefined : findByCode(distritos, id);
  if (!distrito) return notFound(c, 'Distrito');
  const departamento = departamentos.find(
    (d: any) => d.reniec.slice(0, 2) === distrito.reniec.slice(0, 2)
  );
  if (!departamento) return notFound(c, 'Departamento');
  return c.json({ distrito, departamento });
});

// UBIGEOS (Combined)
app.get('/api/ubigeos', async (c) => {
  return c.json({
    ubigeos: distritos.map((d: any) => ({
      ubigeo: d.reniec,
      distrito: d.nombre,
      provincia: provincias.find((p: any) => p.reniec === d.reniec?.substring(0, 4))?.nombre,
      departamento: departamentos.find((dep: any) => dep.reniec === d.reniec?.substring(0, 2))
        ?.nombre,
    })),
  });
});

export default app;
