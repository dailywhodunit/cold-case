const KEY = 'dw-results';

export function saveResult(date, data) {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    stored[date] = data;
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch (e) {
    console.warn('saveResult failed:', e);
  }
}

export function loadResult(date) {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return stored[date] || null;
  } catch (e) {
    return null;
  }
}

export function getTodayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function getUrlDate() {
  const param = new URLSearchParams(window.location.search).get('date');
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) return param;
  return null;
}
