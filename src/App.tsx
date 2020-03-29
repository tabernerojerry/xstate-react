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
      {matchingState.matches('quiz.answering') && (
        <>
          <button
            onClick={() => {
              sendToMatchingMachine({ type: 'CONTINUE' });

              if (
                !matchingState.context.topSelectedItem ||
                !matchingState.context.bottomSelectedItem
              ) {
                alert('Please complete question.');
              }
            }}
          >
            Continue
          </button>
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

      {matchingState.matches('quiz.verifying') && (
        <>
          <p>
            {matchingState.context.topSelectedItem &&
              matchingState.context.topSelectedItem.name}{' '}
            and{' '}
            {matchingState.context.bottomSelectedItem &&
              matchingState.context.bottomSelectedItem.title}
          </p>
          <button
            onClick={() => sendToMatchingMachine({ type: 'CHANGE_ANSWERS' })}
          >
            Change Answers
          </button>
          <button onClick={() => sendToMatchingMachine({ type: 'SUBMIT' })}>
            SUBMIT
          </button>
        </>
      )}

      {matchingState.matches('submitted.correct') && (
        <>
          <p>You are correct!</p>
          <button onClick={() => sendToMatchingMachine({ type: 'RESET' })}>
            Reset
          </button>
        </>
      )}

      {matchingState.matches('submitted.incorrect') && (
        <>
          <p>Incorrect!</p>
          <button onClick={() => sendToMatchingMachine({ type: 'RESET' })}>
            Try Again
          </button>
        </>
      )}
    </div>
  );
};
