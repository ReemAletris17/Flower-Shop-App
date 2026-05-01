import * as FileSystem from 'expo-file-system/legacy'; 
const CACHE_FILE = FileSystem.documentDirectory + 'cached_products.json';

export async function saveProductsToCache(products) {
  try {
    await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving cache:', e);
  }
}

export async function loadProductsFromCache() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CACHE_FILE);
    if (!fileInfo.exists) return null;
    const content = await FileSystem.readAsStringAsync(CACHE_FILE);
    return JSON.parse(content);
  } catch (e) {
    console.error('Error loading cache:', e);
    return null;
  }
}