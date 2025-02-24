import { create } from 'zustand';
import { pick, keyBy } from 'lodash';
import { useShallow } from 'zustand/shallow';
import { useEffect } from 'react';

type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer ElementType> ? ElementType : never;
type ArrayElement<T> = T extends (infer U)[] ? U : T;

function createDataStore<Data, IdField extends keyof Data>(idKey: IdField) {
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
}

const data = [
  { id: 'one', name: '1', value: 1, another: false, userData: 'raz' },
  { id: 'two', name: '2', value: 2, another: true, userData: 'dva' },
];

const store = createDataStore<ArrayElement<typeof data>, 'id'>('id');

const fields = [
  {
    Header: () => {
      console.log('name header');
      return <div> Name </div>;
    },
    Column: ({ rowId }: { rowId: string }) => {
      const [field] = store.usePartialDataField(rowId, 'name');
      console.log('name column', rowId);
      return <div>{field || ''}</div>;
    },
  },
  {
    Header: () => {
      console.log('info header');
      return <div> Info </div>;
    },
    Column: ({ rowId }: { rowId: string }) => {
      const [partialRow] = store.usePartialDataRow(rowId, ['value', 'another']);
      console.log('info column', rowId);
      if (!partialRow) return null;
      return <div>{`value: ${partialRow.value} flag: ${partialRow.another}`}</div>;
    },
  },
  {
    Header: () => {
      console.log('button header');
      return <div></div>;
    },
    Column: ({ rowId }: { rowId: string }) => {
      const [{ value, another } = { value: 1, another: false }, set] = store.usePartialDataRow(
        rowId,
        ['value', 'another']
      );
      console.log('button column', rowId);
      return (
        <button onClick={() => set(rowId, { value: value + 1, another: !another })}>Update</button>
      );
    },
  },
  {
    Header: () => {
      console.log('User Data header');
      return <div>User Data</div>;
    },
    Column: ({ rowId }: { rowId: string }) => {
      const [field, setData] = store.usePartialDataField(rowId, 'userData');
      console.log('User data column', rowId);
      return (
        <input
          type="text"
          value={field}
          onChange={(e) => setData(rowId, { userData: String(e.target.value) })}
        />
      );
    },
  },
];

export const SimpleEditableTable = () => {
  const rowIds = store.useIds();
  const setData = store.useSetData();

  useEffect(() => {
    const timeout = setTimeout(() => setData(data), 2000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div>
      <table>
        <thead>
          {fields.map(({ Header }, index) => (
            <td key={index}>
              <Header />
            </td>
          ))}
        </thead>
        <tbody>
          {rowIds.map((id) => (
            <tr key={id}>
              {fields.map(({ Column }, index) => (
                <td key={index}>
                  <Column rowId={id} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
