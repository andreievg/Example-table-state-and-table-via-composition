import { create } from 'zustand';
import './App.css';
import { useShallow } from 'zustand/shallow';
import { SimpleEditableTable } from './SimpleEditableTable';

export type Data = { name: string; value: number; another: boolean };
export type DataType = Data[];
type Data2 = { ID: string; something: number };
type DataType2 = Data2[];

const THIS_TABLE = 'this_table';
const ANOTHER_TABLE = 'another_table';
type sortDir = 'none' | 'desc' | 'asc';

type Sort = {
  [THIS_TABLE]?: { t: 'Name' | 'Value' | 'Another'; dir: sortDir };
  [ANOTHER_TABLE]?: { t: 'ID' | 'Something'; dir: sortDir };
};

type SetIt = <T extends keyof Sort, K extends Sort[T]>(
  table: T,
  column: K extends { t: infer U } ? U : never,
  dir: sortDir
) => void;

type getColumn = <T extends keyof Sort, K extends Sort[T]>(
  table: T,
  column: K extends { t: infer U } ? U : never
) => sortDir;

const useSort = <T extends keyof Sort, K extends Sort[T]>(
  table: T,
  column: K extends { t: infer U } ? U : never
) => {
  const { setIt, dir } = useSortStore(
    useShallow((state) => ({ setIt: state.setIt, dir: state.getColumn(table, column) }))
  );
  return { set: (dir: sortDir) => setIt(table, column, dir), dir };
};

type DataStore = {
  [THIS_TABLE]?: DataType;
  [ANOTHER_TABLE]?: DataType2;
};

const useSortStore = create<{ sort: Sort } & { setIt: SetIt } & { getColumn: getColumn }>(
  (set, get) => ({
    sort: {},
    setIt: (table, column, dir) =>
      set((state) => ({ ...state, sort: { ...state.sort, [table]: { t: column, dir } } })),
    getColumn: (table, column) => {
      let s = get().sort?.[table];
      return s?.t == column ? s?.dir || 'none' : 'none';
    },
  })
);

const fields = [
  {
    Header: () => {
      let { dir, set } = useSort(THIS_TABLE, 'Name');
      console.log('name');
      return <div onClick={() => set('asc')}>Name {dir}</div>;
    },
    Column: ({ row }: { row: Data }) => <div>{row.name}</div>,
  },
  {
    Header: () => {
      let { dir, set } = useSort(THIS_TABLE, 'Value');
      console.log('value');
      return <div onClick={() => set('asc')}>Value {dir}</div>;
    },
    Column: ({ row }: { row: Data }) => <div>{row.value}</div>,
  },
  {
    Header: () => {
      let { dir, set } = useSort(THIS_TABLE, 'Another');
      console.log('another');
      return <div onClick={() => set('asc')}>another {dir}</div>;
    },
    Column: ({ row }: { row: Data }) => <div>{row.another}</div>,
  },
];

const fields2 = [
  {
    Header: () => {
      let { dir, set } = useSort(ANOTHER_TABLE, 'ID');
      console.log('ID');
      return <div onClick={() => set('asc')}>ID {dir}</div>;
    },
    Column: ({ row }: { row: Data2 }) => <div>{row.ID}</div>,
  },
  {
    Header: () => {
      let { dir, set } = useSort(ANOTHER_TABLE, 'Something');
      console.log('Something');
      return <div onClick={() => set('asc')}>Something {dir}</div>;
    },
    Column: ({ row }: { row: Data2 }) => <div>{row.something}</div>,
  },
];

const useData = () => {
  const data: DataType = [
    { name: 'One', value: 1, another: true },
    { name: 'Two', value: 2, another: false },
  ];
  return data;
};

function App() {
  const data = useData();

  const data2: DataType2 = [
    { ID: 'abc', something: 3 },
    { ID: 'cba', something: 4 },
  ];

  const allFields = [...fields];

  return (
    <div>
      <table>
        <thead>
          {allFields.map(({ Header }) => (
            <td>
              <Header />
            </td>
          ))}
        </thead>
        <tbody>
          {data.map((row) => (
            <tr id={row.name}>
              {allFields.map(({ Column }) => (
                <td>
                  <Column row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          {fields2.map(({ Header }) => (
            <td>
              <Header />
            </td>
          ))}
        </thead>
        <tbody>
          {data2.map((row) => (
            <tr id={row.ID}>
              {fields2.map(({ Column }) => (
                <td>
                  <Column row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <SimpleEditableTable />
    </div>
  );
}

export default App;
