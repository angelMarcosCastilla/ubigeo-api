// Tipos de datos para UBIGEO API

export interface Departamento {
  reniec: string;
  nombre: string;
}

export interface Provincia {
  reniec: string;
  nombre: string;
  departamento: string;
}

export interface Distrito {
  reniec: string;
  nombre: string;
  provincia: string;
  departamento: string;
}

export interface Ubigeo {
  ubigeo: string;
  distrito: string;
  provincia?: string;
  departamento?: string;
}

// Respuestas de la API

export interface DepartamentosResponse {
  departamentos: Departamento[];
}

export interface ProvinciaResponse {
  provincia: Provincia;
}

export interface ProvinciasResponse {
  provincias: Provincia[];
}

export interface DistritoResponse {
  distrito: Distrito;
}

export interface DistritosResponse {
  distritos: Distrito[];
}

export interface UbigeosResponse {
  ubigeos: Ubigeo[];
}

export type ApiResponse =
  | DepartamentosResponse
  | ProvinciaResponse
  | ProvinciasResponse
  | DistritoResponse
  | DistritosResponse
  | UbigeosResponse
  | { error: string };

// Configuración del Rate Limiting

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Cliente tipado

export interface UbigeoClientConfig {
  baseUrl?: string;
  timeout?: number;
}

export class UbigeoClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: UbigeoClientConfig = {}) {
    this.baseUrl = config.baseUrl || "https://ubigeo-api.workers.dev";
    this.timeout = config.timeout || 5000;
  }

  async getDepartamentos(): Promise<Departamento[]> {
    const response = await fetch(`${this.baseUrl}/api/departamentos`);
    const data = (await response.json()) as DepartamentosResponse;
    return data.departamentos;
  }

  async getDepartamento(id: string): Promise<Departamento | null> {
    const response = await fetch(`${this.baseUrl}/api/departamentos/${id}`);
    if (!response.ok) return null;
    const data = (await response.json()) as { departamento: Departamento };
    return data.departamento;
  }

  async getProvincias(): Promise<Provincia[]> {
    const response = await fetch(`${this.baseUrl}/api/provincias`);
    const data = (await response.json()) as ProvinciasResponse;
    return data.provincias;
  }

  async getProvincia(id: string): Promise<Provincia | null> {
    const response = await fetch(`${this.baseUrl}/api/provincias/${id}`);
    if (!response.ok) return null;
    const data = (await response.json()) as ProvinciaResponse;
    return data.provincia;
  }

  async getDistritos(): Promise<Distrito[]> {
    const response = await fetch(`${this.baseUrl}/api/distritos`);
    const data = (await response.json()) as DistritosResponse;
    return data.distritos;
  }

  async getDistrito(id: string): Promise<Distrito | null> {
    const response = await fetch(`${this.baseUrl}/api/distritos/${id}`);
    if (!response.ok) return null;
    const data = (await response.json()) as DistritoResponse;
    return data.distrito;
  }

  async getUbigeos(): Promise<Ubigeo[]> {
    const response = await fetch(`${this.baseUrl}/api/ubigeos`);
    const data = (await response.json()) as UbigeosResponse;
    return data.ubigeos;
  }

  async getProvinciasPerDepartamento(deptId: string): Promise<Provincia[]> {
    const provincias = await this.getProvincias();
    return provincias.filter((p) => p.departamento === deptId);
  }

  async getDistritosPerProvincia(provId: string): Promise<Distrito[]> {
    const distritos = await this.getDistritos();
    return distritos.filter((d) => d.provincia === provId);
  }

  async getDistritosPerDepartamento(deptId: string): Promise<Distrito[]> {
    const distritos = await this.getDistritos();
    return distritos.filter((d) => d.departamento === deptId);
  }

  async validarUbigeo(
    deptId: string,
    provId: string,
    distId: string,
  ): Promise<boolean> {
    try {
      const dept = await this.getDepartamento(deptId);
      const prov = await this.getProvincia(provId);
      const dist = await this.getDistrito(distId);

      return !!(
        dept &&
        prov &&
        prov.departamento === deptId &&
        dist &&
        dist.departamento === deptId
      );
    } catch {
      return false;
    }
  }
}

// Funciones auxiliares

export function extractDepartamentoCode(ubigeo: string): string {
  return ubigeo.substring(0, 2);
}

export function extractProvinciaCode(ubigeo: string): string {
  return ubigeo.substring(0, 4);
}

export function extractDistritoCode(ubigeo: string): string {
  return ubigeo;
}

export function isValidUbigeoFormat(ubigeo: string): boolean {
  return /^\d{6}$/.test(ubigeo);
}
