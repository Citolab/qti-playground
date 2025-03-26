import { DataApi, StoreSyncOptions } from 'rx-basic-store';

export class LocalStorageApi<T> implements DataApi<T> {
  syncOptions: StoreSyncOptions = {
    actions: {
      sync: false,
    },
    state: {
      sync: true,
    },
  };

  getUserId = () => 'default_user';

  getState = async () => {
    const state = await this.getStateFromLocalStorage();
    return Promise.resolve(state!);
  };

  setState = async (document: T) => {
    const state = await this.setStateFromLocalStorage(document);
    return Promise.resolve(state);
  };

  storeAction = async () => {
    return Promise.resolve();
  };

  getStateFromLocalStorage = () => {
    const collectionName = 'state';
    const userId = this.getUserId();
    const state = localStorage.getItem(`${collectionName}_${userId}`);
    try {
      if (state) {
        return JSON.parse(state) as T;
      }
    } catch {
      // ignore error
    }
    return null;
  };

  setStateFromLocalStorage = (doc: T) => {
    const collectionName = 'state';
    const userId = this.getUserId();
    localStorage.setItem(`${collectionName}_${userId}`, JSON.stringify(doc));
  };
}
