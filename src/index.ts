import { Hono } from "hono";
import distritos from "./data/distritos.json";
import provincias from "./data/provincias.json";
import departamentos from "./data/departamentos.json";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/distritos", async (c) => {
  return c.json({
    distritos: distritos,
  });
});

app.get("/api/distritos/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    c.status(400);
    return c.json({
      error: "No id provided",
    });
  }

  const distrito = distritos.find((d) => d.reniec === id);

  if (!distrito) {
    c.status(404);
    return c.json({
      error: "Distrito not found",
    });
  }

  return c.json({
    distrito: distrito,
  });
});

app.get("/api/provincias", async (c) => {
  return c.json({
    provincias: provincias,
  });
});

app.get("/api/provincias/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    c.status(400);
    return c.json({
      error: "No id provided",
    });
  }

  const provincia = provincias.find((p) => p.reniec === id);

  if (!provincia) {
    c.status(404);
    return c.json({
      error: "Provincia not found",
    });
  }

  return c.json({
    provincia: provincia,
  });
});

app.get("/api/departamentos", async (c) => {
  return c.json({
    departamentos: departamentos,
  });
});

app.get("/api/departamentos/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    c.status(400);
    return c.json({
      error: "No id provided",
    });
  }

  const departamento = departamentos.find((d) => d.reniec === id);

  if (!departamento) {
    c.status(404);
    return c.json({
      error: "Departamento not found",
    });
  }

  return c.json({
    departamento: departamento,
  });
});

app.get("/api/ubigeos", async (c) => {});

export default app;
