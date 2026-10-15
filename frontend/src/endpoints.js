const dep = { reniec: '140000', departamento: 'LIMA', capital: 'Lima' };
const prov = { reniec: '140100', departamento: 'LIMA', provincia: 'LIMA', capital: 'Lima' };
const dist = { reniec: '140101', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LIMA' };

const idParam = (label, digits, samples) => ({
  name: 'id',
  label,
  digits,
  samples,
  description: `Código RENIEC de ${digits} dígitos (también acepta el código completo de 6 dígitos).`,
});

const DEP = idParam('departamento', 2, ['14', '01', '24']);
const PROV = idParam('provincia', 4, ['1401', '0101', '2401']);
const DIST = idParam('distrito', 6, ['140101', '010101']);

export const GROUPS = [
  { id: 'departamentos', label: 'Departamentos' },
  { id: 'provincias', label: 'Provincias' },
  { id: 'distritos', label: 'Distritos' },
  { id: 'ubigeos', label: 'Ubigeos' },
];

export const ENDPOINTS = [
  {
    group: 'departamentos',
    path: '/api/departamentos',
    title: 'Listar departamentos',
    description: 'Devuelve los 25 departamentos del Perú (incluye el Callao).',
    response: { departamentos: [dep] },
    fields: { reniec: 'Código RENIEC (6 dígitos)', inei: 'Código INEI', departamento: 'Nombre', capital: 'Capital' },
  },
  {
    group: 'departamentos',
    path: '/api/departamentos/:id',
    title: 'Obtener un departamento',
    description: 'Busca un departamento por su código RENIEC.',
    param: DEP,
    response: { departamento: dep },
    notFound: 'Departamento',
  },
  {
    group: 'departamentos',
    path: '/api/departamentos/:id/provincias',
    title: 'Provincias de un departamento',
    description: 'Lista las provincias que pertenecen al departamento indicado.',
    param: DEP,
    response: { departamento: dep, provincias: [prov] },
    notFound: 'Departamento',
  },
  {
    group: 'departamentos',
    path: '/api/departamentos/:id/distritos',
    title: 'Distritos de un departamento',
    description: 'Lista todos los distritos del departamento, sin importar la provincia.',
    param: DEP,
    response: { departamento: dep, distritos: [dist] },
    notFound: 'Departamento',
  },
  {
    group: 'provincias',
    path: '/api/provincias',
    title: 'Listar provincias',
    description: 'Devuelve todas las provincias del Perú.',
    response: { provincias: [prov] },
  },
  {
    group: 'provincias',
    path: '/api/provincias/:id',
    title: 'Obtener una provincia',
    description: 'Busca una provincia por su código RENIEC.',
    param: PROV,
    response: { provincia: prov },
    notFound: 'Provincia',
  },
  {
    group: 'provincias',
    path: '/api/provincias/:id/distritos',
    title: 'Distritos de una provincia',
    description: 'Lista los distritos que pertenecen a la provincia indicada.',
    param: PROV,
    response: { provincia: prov, distritos: [dist] },
    notFound: 'Provincia',
  },
  {
    group: 'provincias',
    path: '/api/provincias/:id/departamento',
    title: 'Departamento de una provincia',
    description: 'Devuelve el departamento al que pertenece la provincia.',
    param: PROV,
    response: { provincia: prov, departamento: dep },
    notFound: 'Provincia',
  },
  {
    group: 'distritos',
    path: '/api/distritos',
    title: 'Listar distritos',
    description: 'Devuelve todos los distritos del Perú.',
    response: { distritos: [dist] },
  },
  {
    group: 'distritos',
    path: '/api/distritos/:id',
    title: 'Obtener un distrito',
    description: 'Busca un distrito por su código RENIEC.',
    param: DIST,
    response: { distrito: dist },
    notFound: 'Distrito',
  },
  {
    group: 'distritos',
    path: '/api/distritos/:id/provincia',
    title: 'Provincia de un distrito',
    description: 'Devuelve la provincia a la que pertenece el distrito.',
    param: DIST,
    response: { distrito: dist, provincia: prov },
    notFound: 'Distrito',
  },
  {
    group: 'distritos',
    path: '/api/distritos/:id/departamento',
    title: 'Departamento de un distrito',
    description: 'Devuelve el departamento al que pertenece el distrito.',
    param: DIST,
    response: { distrito: dist, departamento: dep },
    notFound: 'Distrito',
  },
  {
    group: 'ubigeos',
    path: '/api/ubigeos',
    title: 'Listar ubigeos',
    description: 'Distritos combinados con el nombre de su provincia y departamento.',
    response: { ubigeos: [{ ubigeo: '140101', distrito: 'LIMA', provincia: 'LIMA', departamento: 'LIMA' }] },
  },
];
