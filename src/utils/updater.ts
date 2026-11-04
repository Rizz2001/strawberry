export const APP_VERSION = '1.0.5';
export const STORAGE_KEY_UPDATE_URL = 'strawchell_update_manifest_url';

export const GITHUB_REPO = 'Rizz2001/strawberry';
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const DEFAULT_UPDATE_MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/public/version.json`;

export interface RemoteVersionManifest {
  version: string;
  publishedAt?: string;
  notes?: string;
  /** Enlace directo al nuevo archivo .apk */
  apkUrl?: string;
  /** Enlace web / Release */
  webUrl?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  manifest?: RemoteVersionManifest;
  error?: string;
}

export function getUpdateManifestUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_UPDATE_URL) || DEFAULT_UPDATE_MANIFEST_URL;
  } catch {
    return DEFAULT_UPDATE_MANIFEST_URL;
  }
}

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
 * Compara dos versiones semánticas (ej. "1.0.0" vs "1.0.2").
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
 * Consulta con estrategia dual:
 * 1. Intenta consultar directamente la API oficial de GitHub Releases (sin retraso de caché).
 * 2. Si falla o hay límite de peticiones, consulta el archivo version.json en raw.githubusercontent.com.
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

  // Estrategia 1: GitHub API Releases Oficial
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const apiRes = await fetch(GITHUB_API_LATEST_RELEASE, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const releaseData = await apiRes.json();
      if (releaseData && typeof releaseData.tag_name === 'string') {
        const remoteTag = releaseData.tag_name.replace(/^v/i, '').trim();
        const apkAsset = Array.isArray(releaseData.assets)
          ? releaseData.assets.find((a: { name: string }) => a.name.endsWith('.apk'))
          : null;

        const downloadUrl =
          apkAsset?.browser_download_url ||
          `https://github.com/${GITHUB_REPO}/releases/download/${releaseData.tag_name}/strawchell.apk`;

        const hasUpdate = isNewerVersion(APP_VERSION, remoteTag);

        return {
          hasUpdate,
          currentVersion: APP_VERSION,
          latestVersion: remoteTag,
          manifest: {
            version: remoteTag,
            publishedAt: releaseData.published_at?.slice(0, 10),
            notes: releaseData.body || releaseData.name || 'Nueva versión disponible en GitHub.',
            apkUrl: downloadUrl,
            webUrl: releaseData.html_url,
          },
        };
      }
    }
  } catch {
    // Si la API falla, continuar con Estrategia 2 (version.json)
  }

  // Estrategia 2: version.json
  const manifestUrl = getUpdateManifestUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

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

    if (response.ok) {
      const data = (await response.json()) as RemoteVersionManifest;
      if (data && typeof data.version === 'string') {
        const hasUpdate = isNewerVersion(APP_VERSION, data.version);
        return {
          hasUpdate,
          currentVersion: APP_VERSION,
          latestVersion: data.version,
          manifest: data,
        };
      }
    }

    return {
      hasUpdate: false,
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      error: 'No se pudo conectar al canal de actualizaciones de GitHub.',
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
 * Ejecuta la actualización abriendo el enlace directo del APK para instalarlo encima
 * conservando el 100% de los datos de la caja (localStorage)
 */
export async function applyAppUpdate(manifest?: RemoteVersionManifest): Promise<void> {
  const targetUrl =
    manifest?.apkUrl ||
    `https://github.com/${GITHUB_REPO}/releases/latest/download/strawchell.apk`;

  window.open(targetUrl, '_system');

  // Fallback por si '_system' no es soportado
  const a = document.createElement('a');
  a.href = targetUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}
