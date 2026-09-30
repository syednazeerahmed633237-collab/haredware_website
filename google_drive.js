/* =========================================================
   LOG HARDWARE - GOOGLE DRIVE IMAGE CONNECTOR
   Frontend-only version: HTML + CSS + JavaScript

   IMPORTANT:
   - Keep the API key restricted to your GitHub Pages origin.
   - Restrict it to the Google Drive API.
   - This connector reads image files from the configured folder.
   ========================================================= */

const GOOGLE_DRIVE_CONFIG = {
  API_KEY: 'AIzaSyA1974JwYp1Qc8RMwUD3RM71sx_yI_k6kQ',
  FOLDER_ID: '1bKz5OdLYc6XTXeT-9FjgA8iceKlKyWAZ'
};

const GOOGLE_DRIVE_FILES_API =
  'https://www.googleapis.com/drive/v3/files';

const GOOGLE_DRIVE_THUMBNAIL_URL =
  'https://drive.google.com/thumbnail';

function normalizeDriveValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function parseGoogleDriveFilename(filename) {
  if (!filename) return null;

  const name = filename.replace(/\.[^/.]+$/, '');
  const match = name.match(/^(.+?)-C-(.+?)-B-(.+?)-S-(.+?)-CO-(.+)$/i);

  if (!match) return null;

  return {
    filename,
    product: normalizeDriveValue(match[1]),
    category: normalizeDriveValue(match[2]),
    brand: normalizeDriveValue(match[3]),
    size: String(match[4] || '').trim(),
        partNumber: String(match[4] || '').trim(),
        coCode: String(match[5] || '').trim()
  };
}

function getGoogleDriveImageUrl(fileId) {
  if (!fileId) return '';
  return `${GOOGLE_DRIVE_THUMBNAIL_URL}?id=${encodeURIComponent(fileId)}&sz=w1600`;
}

async function getGoogleDriveImages() {
  const { API_KEY, FOLDER_ID } = GOOGLE_DRIVE_CONFIG;

  if (!API_KEY || API_KEY === 'PASTE_YOUR_RESTRICTED_GOOGLE_API_KEY_HERE') {
    console.warn('Google Drive API key is not configured.');
    return [];
  }

  if (!FOLDER_ID) {
    console.warn('Google Drive folder ID is not configured.');
    return [];
  }

  const files = [];
  let pageToken = '';

  try {
    do {
      const params = new URLSearchParams({
        q: `'${FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`,
        fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime)',
        pageSize: '100',
        orderBy: 'name',
        key: API_KEY
      });

      if (pageToken) params.set('pageToken', pageToken);

      const response =
        await fetch(`${GOOGLE_DRIVE_FILES_API}?${params.toString()}`);

      if (!response.ok) {
        let message = `Google Drive API returned ${response.status}.`;
        try {
          const error = await response.json();
          message = error?.error?.message || message;
        } catch (_) {}
        throw new Error(message);
      }

      const data = await response.json();
      files.push(...(data.files || []));
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return files;
  } catch (error) {
    console.error('Google Drive image loading failed:', error);
    return [];
  }
}

function buildGoogleDriveImageIndex(files) {
  const index = {};

  files.forEach(file => {
    const parsed = parseGoogleDriveFilename(file.name);
    if (!parsed) return;

    const item = {
      fileId: file.id,
      filename: file.name,
      image: getGoogleDriveImageUrl(file.id),
      product: parsed.product,
      category: parsed.category,
      brand: parsed.brand,
      size: parsed.size,
            partNumber: parsed.partNumber,
            coCode: parsed.coCode,
      mimeType: file.mimeType || '',
      modifiedTime: file.modifiedTime || ''
    };

    if (!index[parsed.product]) index[parsed.product] = [];
    index[parsed.product].push(item);
  });

  return index;
}

async function getGoogleDrivePartIndex() {
  const files = await getGoogleDriveImages();
  return buildGoogleDriveImageIndex(files);
}

async function loadGoogleDriveImagesIntoProducts(products) {
  const index = await getGoogleDrivePartIndex();

  if (!Array.isArray(products)) return index;

  products.forEach(product => {
    const images = index[normalizeDriveValue(product.id)] || [];
    product.driveImages = images;
    if (images[0]) product.image = images[0].image;
  });

  return index;
}

window.GoogleDriveConnector = {
  getGoogleDriveImages,
  buildGoogleDriveImageIndex,
  getGoogleDrivePartIndex,
  loadGoogleDriveImagesIntoProducts,
  parseGoogleDriveFilename
};
