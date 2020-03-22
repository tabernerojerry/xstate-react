import React from 'react';
import { useMachine } from '@xstate/react';

import { fetchMachine } from './machines/fetch-machine';

const fetchUsers = 'https://jsonplaceholder.typicode.com/users';

export const App = () => {
  const [fetchState, sendToFetchMachine] = useMachine(fetchMachine, {
    actions: {
      fetchData: async (context, event) => {
        try {
          const response = await fetch(fetchUsers);
          const users = await response.json();
          console.log(users);
          sendToFetchMachine({ type: 'RESOLVE', results: users || [] });
        } catch (e) {
          console.log(e);
          sendToFetchMachine({
            type: 'REJECT',
            message: 'Something went wrong!',
          });
        }
      },
    },
  });
  return (
    <div>
      <button onClick={() => sendToFetchMachine({ type: 'FETCH' })}>
        Fecth
      </button>

      {fetchState.matches('pending') && <p>Loading...</p>}

      {fetchState.matches('success') ? (
        <ul>
          {fetchState.context.results &&
            fetchState.context.results.map((user: any) => (
              <li key={user.id}>{user.name}</li>
            ))}
        </ul>
      ) : null}

      {fetchState.matches('failed') && (
        <p>Error: {fetchState.context.message}</p>
      )}
    </div>
  );
};
