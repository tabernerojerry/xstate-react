import React from 'react';
import { useMachine } from '@xstate/react';

import { matchingMachine } from './machines/matching-machine';
import { List } from './List';

const apiUsers = 'https://jsonplaceholder.typicode.com/users';
const apiPosts = 'https://jsonplaceholder.typicode.com/posts';

export const App = () => {
  const [matchingState, sendToMatchingMachine] = useMachine(matchingMachine);

  return (
    <div className="App">
      {matchingState.matches('answering') && (
        <>
          <List
            keyName="name"
            fetchData={() => fetch(apiUsers).then(r => r.json())}
            selectedItem={matchingState.context.topSelectedItem}
            onSelection={selectedItem =>
              sendToMatchingMachine({ type: 'SELECT_TOP', selectedItem })
            }
          ></List>

          <hr />

          <List
            keyName="title"
            fetchData={() => fetch(apiPosts).then(r => r.json())}
            selectedItem={matchingState.context.bottomSelectedItem}
            onSelection={selectedItem =>
              sendToMatchingMachine({ type: 'SELECT_BOTTOM', selectedItem })
            }
          ></List>
        </>
      )}

      {matchingState.matches('submitted.correct') && <p>You are correct!</p>}

      {matchingState.matches('submitted.incorrect') && (
        <p>Incorrect! Try again...</p>
      )}
    </div>
  );
};
