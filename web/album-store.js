const storeName = "entries";

function openAlbum() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("last-stop-seoul-album", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function useAlbum(mode, operation) {
  const database = await openAlbum();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const request = operation(transaction.objectStore(storeName));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(request.error ?? transaction.error ?? new Error("Album transaction aborted"));
    });
  } finally {
    database.close();
  }
}

export const readAlbum = () => useAlbum("readonly", (store) => store.getAll());
export const saveEntry = (entry) => useAlbum("readwrite", (store) => store.add(entry));
export const removeEntry = (id) => useAlbum("readwrite", (store) => store.delete(id));
