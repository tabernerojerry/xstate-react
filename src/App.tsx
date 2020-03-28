import React from 'react';
import { useMachine } from '@xstate/react';

import { fetchMachine } from './machines/fetch-machine';
import { matchingMachine } from './machines/matching-machine';

const apiUsers = 'https://jsonplaceholder.typicode.com/users';
const apiPosts = 'https://jsonplaceholder.typicode.com/posts';

export const App = () => {
  const [fetchUsers, sendToUsersMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: (ctx, event) =>
        fetch(apiUsers)
          .then(r => r.json())
          .then(data => data),
    },
  });

  const [fetchPosts, sendToPostsMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: (ctx, event) =>
        fetch(apiPosts)
          .then(r => r.json())
          .then(data => data),
    },
  });

  const [matchingState, sendToMatchingMachine] = useMachine(matchingMachine);

  return (
    <div className="App">
      {matchingState.matches('answering') && (
        <>
          <button onClick={() => sendToUsersMachine({ type: 'FETCH' })}>
            Fecth
          </button>

          {fetchUsers.matches('pending') && <p>Loading...</p>}

          {fetchUsers.matches('success.withData') && (
            <ul>
              {fetchUsers.context.results.map((user: any) => (
                <li key={user.id}>
                  <button
                    style={{
                      backgroundColor:
                        matchingState.context.topSelectedItem === user
                          ? 'blue'
                          : '',
                    }}
                    onClick={() =>
                      sendToMatchingMachine({
                        type: 'SELECT_TOP',
                        selectedItem: user,
                      })
                    }
                  >
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {fetchUsers.matches('success.emptyData') && <p>No data available.</p>}

          {fetchUsers.matches('failed') && (
            <p>Error: {fetchUsers.context.message}</p>
          )}

          <hr />

          <button onClick={() => sendToPostsMachine({ type: 'FETCH' })}>
            Fecth
          </button>

          {fetchPosts.matches('pending') && <p>Loading...</p>}

          {fetchPosts.matches('success.withData') && (
            <ul>
              {fetchPosts.context.results.map((post: any) => (
                <li key={post.id}>
                  <button
                    style={{
                      backgroundColor:
                        matchingState.context.bottomSelectedItem === post
                          ? 'blue'
                          : '',
                    }}
                    onClick={() =>
                      sendToMatchingMachine({
                        type: 'SELECT_BOTTOM',
                        selectedItem: post,
                      })
                    }
                  >
                    {post.title}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {fetchPosts.matches('success.emptyData') && <p>No data available.</p>}

          {fetchPosts.matches('failed') && (
            <p>Error: {fetchPosts.context.message}</p>
          )}
        </>
      )}

      {matchingState.matches('submitted.correct') && <p>You are correct!</p>}

      {matchingState.matches('submitted.incorrect') && (
        <p>Incorrect! Try again...</p>
      )}
    </div>
  );
};
