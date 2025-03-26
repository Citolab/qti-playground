import { createContext, useContext } from 'react';
import { Store, StoreType } from 'rx-basic-store';
import { LocalStorageApi } from './localstorage.api';
import { StateModel, initialState } from './store';

export type StoreContext = {
  store: StoreType<StateModel>;
};

const api = new LocalStorageApi<StateModel>();
const prod = import.meta.env.PROD;

const store = new Store<StateModel>({ ...initialState }, !!prod, api);

export const getStoreContext = () => {
  return { store };
};

export const StoreContext = createContext<StoreContext>(getStoreContext());
export const UseStoreContext = () => useContext(StoreContext);
