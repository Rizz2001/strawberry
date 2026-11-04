export const APP_VERSION = '1.0.1';
export const STORAGE_KEY_UPDATE_URL = 'strawchell_update_manifest_url';

/**
 * URL por defecto donde la app buscará actualizaciones cuando el teléfono tenga internet.
 * Puedes usar una variable de entorno VITE_UPDATE_MANIFEST_URL (ej. tu repositorio de GitHub o dominio en Vercel)
 * o configurarla directamente desde el panel de la app.
 */
export const DEFAULT_UPDATE_MANIFEST_URL =
  import.meta.env.VITE_UPDATE_MANIFEST_URL ||
  'https://raw.githubusercontent.com/Rizz2001/strawberry/main/public/version.json';

export interface RemoteVersionManifest {
  version: string;
  publishedAt?: string;
  notes?: string;
  /** Enlace directo al nuevo archivo .apk (ej. en GitHub Releases) */
  apkUrl?: string;
  /** Enlace web / OTA opcional */
  webUrl?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  manifest?: RemoteVersionManifest;
  error?: string;
}

/**
 * Obtiene la URL del manifiesto de actualización configurada
 */
export function getUpdateManifestUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_UPDATE_URL) || DEFAULT_UPDATE_MANIFEST_URL;
  } catch {
    return DEFAULT_UPDATE_MANIFEST_URL;
  }
}

/**
 * Guarda una URL personalizada para el servidor de actualizaciones
 */
export function setUpdateManifestUrl(url: string): void {
  try {
    const clean = url.trim();
    if (!clean) {
      localStorage.removeItem(STORAGE_KEY_UPDATE_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_UPDATE_URL, clean);
    }
  } catch (err) {
    console.error('Error guardando URL de actualización:', err);
  }
}

/**
 * Compara dos versiones semánticas (ej. "1.0.0" vs "1.1.0").
 * Retorna true si remoteVersion > localVersion.
 */
export function isNewerVersion(localVersion: string, remoteVersion: string): boolean {
  const cleanLocal = localVersion.replace(/^v/i, '').trim().split('.').map(Number);
  const cleanRemote = remoteVersion.replace(/^v/i, '').trim().split('.').map(Number);

  const maxLen = Math.max(cleanLocal.length, cleanRemote.length, 3);
  for (let i = 0; i < maxLen; i++) {
    const l = cleanLocal[i] || 0;
    const r = cleanRemote[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

/**
 * Consulta silenciosamente si existe una nueva versión disponible.
 * Si el teléfono está sin internet (offline), retorna inmediatamente sin bloquear nada.
 */
export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      hasUpdate: false,
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      error: 'El teléfono está sin conexión a internet (Modo 100% Offline activo).',
    };
  }

  const manifestUrl = getUpdateManifestUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`${manifestUrl}${cacheBuster}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        hasUpdate: false,
        currentVersion: APP_VERSION,
        latestVersion: APP_VERSION,
        error: `No se pudo conectar al canal de actualizaciones (HTTP ${response.status}).`,
      };
    }

    const data = (await response.json()) as RemoteVersionManifest;
    if (!data || typeof data.version !== 'string') {
      return {
        hasUpdate: false,
        currentVersion: APP_VERSION,
        latestVersion: APP_VERSION,
        error: 'El archivo version.json remoto no tiene un formato válido.',
      };
    }

    const hasUpdate = isNewerVersion(APP_VERSION, data.version);

    return {
      hasUpdate,
      currentVersion: APP_VERSION,
      latestVersion: data.version,
      manifest: data,
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      hasUpdate: false,
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      error: 'No se encontró conexión con el servidor de actualizaciones.',
    };
  }
}

/**
 * Ejecuta la actualización conservando intacto todo el localStorage (tasa, caja e historial)
 */
export async function applyAppUpdate(manifest?: RemoteVersionManifest): Promise<void> {
  // 1. Si el manifiesto trae un enlace directo de APK para Android, abrirlo para instalar encima
  if (manifest?.apkUrl && manifest.apkUrl.trim().length > 0) {
    window.open(manifest.apkUrl.trim(), '_blank', 'noopener,noreferrer');
    return;
  }

  // 2. Si es actualización web / OTA, limpiar caché de archivos estáticos (NUNCA localStorage) y recargar
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // Ignorar errores de Cache API
    }
  }

  window.location.reload();
}

