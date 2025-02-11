class IndexDBHelper {
  /**
   * Creates an instance of IndexDBHelper.
   * @param {string} dbName - The name of the IndexedDB database.
   * @param {number} [version=1] - The version of the IndexedDB database.
   */
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.storeName = 'platformData';
  }

  /**
   * Initializes the IndexedDB database and creates an object store if it doesn't exist.
   * @returns {Promise<IDBDatabase>} A promise that resolves with the opened database instance.
   * @throws {string} Error message if the database cannot be opened.
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(`Error opening the database: ${request.error}`);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Saves platform data into the IndexedDB.
   * @param {string} platformName - The name of the platform.
   * @param {Object} data - The data to be saved for the platform.
   * @returns {Promise<string>} A promise that resolves with a success message upon data save.
   * @throws {string} Error message if the data cannot be saved.
   */
  async savePlatformData(platformName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.put(data, platformName);

      request.onsuccess = () => {
        resolve(`Data saved for ${platformName}`);
      };

      request.onerror = () => {
        reject(`Error saving data for ${platformName}`);
      };
    });
  }

  /**
   * Retrieves platform data from the IndexedDB.
   * @param {string} platformName - The name of the platform to retrieve data for.
   * @returns {Promise<Object|null>} A promise that resolves with the platform data, or null if not found.
   * @throws {string} Error message if the data cannot be retrieved.
   */
  async getPlatformData(platformName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.get(platformName);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(`Error retrieving data for ${platformName}`);
      };
    });
  }

  /**
   * Deletes platform data from the IndexedDB.
   * @param {string} platformName - The name of the platform whose data is to be deleted.
   * @returns {Promise<string>} A promise that resolves with a success message upon data deletion.
   * @throws {string} Error message if the data cannot be deleted.
   */
  async deletePlatformData(platformName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(platformName);

      request.onsuccess = () => {
        resolve(`Data deleted for ${platformName}`);
      };

      request.onerror = () => {
        reject(`Error deleting data for ${platformName}`);
      };
    });
  }

  /**
   * Retrieves all platform names stored in the IndexedDB.
   * @returns {Promise<Array<string>>} A promise that resolves with an array of platform names.
   * @throws {string} Error message if the platform names cannot be retrieved.
   */
  async getAllPlatforms() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject('Error retrieving platforms');
      };
    });
  }

  /**
   * Clears all data from the IndexedDB for the specified object store.
   * This can be used for clearing all platform data when the user logs out.
   * @returns {Promise<string>} A promise that resolves with a success message when all data is cleared.
   * @throws {string} Error message if the data cannot be cleared.
   */
  async clearAllData() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();

      request.onsuccess = () => {
        resolve('All data cleared successfully');
      };

      request.onerror = () => {
        reject('Error clearing all data');
      };
    });
  }
}

export default IndexDBHelper;