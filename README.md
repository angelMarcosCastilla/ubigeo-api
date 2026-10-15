# UBIGEO API · Perú

API REST de solo lectura con los **departamentos, provincias y distritos del Perú**, con sus códigos de UBIGEO de RENIEC e INEI. Construida con [Hono](https://hono.dev) sobre [Cloudflare Workers](https://workers.cloudflare.com), e incluye una consola interactiva estilo Postman para explorarla.

**🔗 URL base: <https://ubigeo-api.angelmarcoscastilla15.workers.dev/>**

> [!WARNING]
> **Proyecto con fines educativos.** Puedes usar la instancia pública para probar, aprender o hacer prototipos, pero **no se recomienda para producción**: no hay garantía de disponibilidad, estabilidad de los datos ni soporte, y está limitada a 100 peticiones por minuto por IP. Si lo necesitas en producción, despliega tu propia instancia (ver [Despliegue](#despliegue)).

## Características

- Departamentos, provincias, distritos y ubigeos combinados.
- Consultas anidadas siguiendo la jerarquía departamento → provincia → distrito.
- CORS abierto (`*`): consúmela desde cualquier origen.
- Rate limit de 100 req/min por IP, con headers `X-RateLimit-*`.
- Consola web en `/`: barra lateral con todos los endpoints, envío de peticiones, resultados y documentación por endpoint, con tema claro/oscuro.

## Inicio rápido

```bash
curl https://ubigeo-api.angelmarcoscastilla15.workers.dev/api/departamentos/14/provincias
```

```js
const res = await fetch('https://ubigeo-api.angelmarcoscastilla15.workers.dev/api/distritos/140101');
const { distrito } = await res.json();
```

## Códigos

Los códigos `reniec` tienen 6 dígitos: `DDPPTT` (departamento, provincia, distrito). Cada endpoint acepta el código corto de su nivel o el código completo de 6 dígitos:

| Nivel | Código corto | Código completo |
|-------|--------------|-----------------|
| Departamento | `14` | `140000` |
| Provincia | `1401` | `140100` |
| Distrito | `140101` | `140101` |

> Los códigos RENIEC e INEI **no son siempre iguales** (por ejemplo, Lima es `14` en RENIEC y `15` en INEI). Los endpoints buscan siempre por RENIEC; el código INEI se devuelve en el campo `inei`.

## Endpoints

Todos son `GET` y responden JSON.

| Endpoint | Descripción |
|----------|-------------|
| `/api/departamentos` | Lista los departamentos |
| `/api/departamentos/:id` | Un departamento |
| `/api/departamentos/:id/provincias` | Provincias del departamento |
| `/api/departamentos/:id/distritos` | Distritos del departamento |
| `/api/provincias` | Lista las provincias |
| `/api/provincias/:id` | Una provincia |
| `/api/provincias/:id/distritos` | Distritos de la provincia |
| `/api/provincias/:id/departamento` | Departamento de la provincia |
| `/api/distritos` | Lista los distritos |
| `/api/distritos/:id` | Un distrito |
| `/api/distritos/:id/provincia` | Provincia del distrito |
| `/api/distritos/:id/departamento` | Departamento del distrito |
| `/api/ubigeos` | Distritos con nombre de provincia y departamento |

### Ejemplo

`GET /api/departamentos/14/provincias`

```json
{
  "departamento": { "reniec": "140000", "inei": "150000", "departamento": "LIMA" },
  "provincias": [{ "reniec": "140100", "provincia": "LIMA", "departamento": "LIMA" }]
}
```

(Las respuestas reales incluyen más campos, como superficie, coordenadas e indicadores.)

### Errores y límites

| Código | Motivo |
|--------|--------|
| `404` | Recurso no encontrado o código con formato inválido para ese nivel |
| `429` | Se superaron las 100 peticiones por minuto |

## Desarrollo local

Requisitos: Node.js 18+.

```bash
npm install
npm run build:frontend   # compila la consola web en frontend/dist
npm run dev              # wrangler dev: API + frontend en http://localhost:8787
```

Para trabajar solo en el frontend con recarga en caliente: `cd frontend && npm run dev`.

## Despliegue

Necesitas una cuenta de Cloudflare y `wrangler` autenticado (`npx wrangler login`).

```bash
npm run deploy   # compila el frontend y publica el Worker
```

El Worker sirve la consola desde `frontend/dist` (Workers Static Assets, configurado en [`wrangler.toml`](./wrangler.toml)); las rutas `/api/*` las atiende Hono.

## Estructura

```
├── src/
│   ├── index.ts          # API (Hono): rutas, CORS y rate limit
│   └── data/             # departamentos.json, provincias.json, distritos.json
├── frontend/             # Consola web (React + Vite)
└── wrangler.toml         # Configuración de Cloudflare Workers
```

## Fuente de los datos

Los datos provienen del repositorio [**jmcastagnetto/ubigeo-peru-aumentado**](https://github.com/jmcastagnetto/ubigeo-peru-aumentado) de Jesús M. Castagnetto: equivalencias entre los códigos de UBIGEO de RENIEC e INEI, ampliadas con macrorregiones, coordenadas, superficie, altitud e indicadores. Consulta ese repositorio para el detalle de los campos, su licencia y sus condiciones de uso.

Los datos se incluyen tal cual en este proyecto y **pueden estar desactualizados**; para usos oficiales, verifica con las fuentes de [RENIEC](https://www.reniec.gob.pe) e [INEI](https://www.inei.gob.pe). Un distrito del archivo (Santa María de Huachipa) no tiene código RENIEC, por lo que no aparece en las consultas anidadas por departamento o provincia.

## Licencia y créditos

Proyecto educativo, sin garantías de ningún tipo. Los datos pertenecen a sus fuentes originales y se rigen por la licencia del repositorio mencionado.
