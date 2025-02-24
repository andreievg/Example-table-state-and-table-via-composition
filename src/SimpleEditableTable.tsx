import { useEffect } from 'react';
import { createDataStore, ArrayElement } from './utils';

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
