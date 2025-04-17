import { observable, type Observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncObservable } from '@legendapp/state/sync';

export interface V2 {
  version: number;
  updatedAt: number;
  data: { [x: string]: any };
}

export const formData: Observable<V2> = observable<V2>({
  version: 1,
  updatedAt: 0,
  data: {},
});
// Persist the observable to the named key of the global persist plugin
syncObservable(formData, {
  persist: {
    name: 'form-data',
    plugin: ObservablePersistLocalStorage,
  },
});
