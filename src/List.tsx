import React, { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { fetchMachine } from './machines/fetch-machine';

interface IProps {
  keyName: string;
  fetchData: () => Promise<{ results: any[] }>;
  selectedItem: any;
  onSelection: (item: any) => void;
}

export const List: React.FC<IProps> = ({
  keyName,
  fetchData,
  selectedItem,
  onSelection,
}) => {
  const [fetchDataState, sendToDataMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: () => fetchData().then(results => results),
    },
  });

  useEffect(() => {
    sendToDataMachine({ type: 'FETCH' });
  }, [sendToDataMachine]);

  return (
    <>
      <button onClick={() => sendToDataMachine({ type: 'FETCH' })}>
        Fecth
      </button>

      {fetchDataState.matches('pending') && <p>Loading...</p>}

      {fetchDataState.matches('success.withData') && (
        <ul>
          {fetchDataState.context.results.map((item: any) => (
            <li key={item.id}>
              <button
                className={
                  selectedItem && selectedItem.id === item.id ? 'selected' : ''
                }
                onClick={() => onSelection(item)}
              >
                {item[keyName]}
              </button>
            </li>
          ))}
        </ul>
      )}

      {fetchDataState.matches('success.emptyData') && <p>No data available.</p>}

      {fetchDataState.matches('failed') && (
        <p>Error: {fetchDataState.context.message}</p>
      )}
    </>
  );
};
