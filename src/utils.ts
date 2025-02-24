import { create } from 'zustand';
import { pick } from 'lodash';
import { useShallow } from 'zustand/shallow';

export type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer ElementType> ? ElementType : never;
export type ArrayElement<T> = T extends (infer U)[] ? U : T;

export const createDataStore = <Data, IdField extends keyof Data>(idKey: IdField) => {
  type State = {
    data: Data[];
    dataIdIndex: { [id: string]: number };
    patchById: { [id: string]: Partial<Data> };
    setData: (_: Data[]) => void;
    setPartial: (id: string, value: Partial<Data>) => void;
  };

  const getRow = ({ data, dataIdIndex, patchById }: State, id: string) => {
    const row = data[dataIdIndex[id]];
    if (!row) return undefined;
    const patchRow = patchById[id] || {};
    return { ...row, ...patchRow };
  };

  const useData = create<State>((set) => ({
    data: [],
    dataIdIndex: {},
    patchById: {},
    setData: (data) =>
      set((state) => ({
        ...state,
        data,
        dataIdIndex: data.reduce(
          (acc, row, index) => ({ ...acc, [String(row[idKey])]: index }),
          {}
        ),
      })),
    setPartial: (id, value) => {
      set((state) => ({
        ...state,
        patchById: { ...state.patchById, [id]: { ...(state.patchById[id] || {}), ...value } },
      }));
    },
  }));

  const usePartialDataRow = <K extends (keyof Data)[]>(
    id: string,
    keys: K
  ): [undefined | Pick<Data, ElementType<K>>, State['setPartial']] => {
    const row = useData(
      useShallow((state) => {
        let row = getRow(state, id);

        return row && pick(row, keys);
      })
    );
    const set = useData(useShallow((state) => state.setPartial));
    return [row, set];
  };

  const usePartialDataField = <K extends keyof Data>(
    id: string,
    key: K
  ): [undefined | Data[K], State['setPartial']] =>
    useData(
      useShallow((state) => {
        let row = getRow(state, id);
        return [row && row[key], state.setPartial];
      })
    );

  const useIds = () => useData(useShallow((state) => state.data.map((row) => row[idKey])));

  return {
    useData,
    usePartialDataRow,
    usePartialDataField,
    useIds,
    useSetData: () => useData(useShallow((state) => state.setData)),
  };
};
