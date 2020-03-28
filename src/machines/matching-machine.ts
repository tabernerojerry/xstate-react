import { Machine, assign } from 'xstate';

interface IMatchingStatesSchema {
  states: {
    answering: {
      states: {
        topList: {
          states: {
            unselected: {};
            selected: {};
          };
        };
        bottomList: {
          states: {
            unselected: {};
            selected: {};
          };
        };
      };
    };
    submitted: {
      states: {
        evaluating: {};
        correct: {};
        incorrect: {};
      };
    };
  };
}

interface IMatchingContext {
  topSelectedItem: any | undefined;
  bottomSelectedItem: any | undefined;
}

type TMatchingEvents =
  | { type: 'SELECT_TOP'; selectedItem: any }
  | { type: 'SELECT_BOTTOM'; selectedItem: any }
  | { type: 'RESET' };

export const matchingMachine = Machine<
  IMatchingContext,
  IMatchingStatesSchema,
  TMatchingEvents
>(
  {
    id: 'matchingMachine',
    initial: 'answering',
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined,
    },
    states: {
      answering: {
        type: 'parallel',
        onDone: 'submitted',
        states: {
          topList: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  SELECT_TOP: {
                    target: 'selected',
                    actions: ['setTopSelectedItem'],
                  },
                },
              },
              selected: {
                type: 'final',
              },
            },
          },
          bottomList: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  SELECT_BOTTOM: {
                    target: 'selected',
                    actions: ['setBottomSelectedItem'],
                  },
                },
              },
              selected: {
                type: 'final',
              },
            },
          },
        },
      },
      submitted: {
        // on: {},
        initial: 'evaluating',
        states: {
          evaluating: {
            on: {
              // Automactic transition
              '': [
                {
                  target: 'correct',
                  cond: 'isCorrect',
                },
                {
                  target: 'incorrect',
                },
              ],
            },
          },
          correct: {},
          incorrect: {},
        },
      },
    },
  },
  {
    actions: {
      setTopSelectedItem: assign((context, event: any) => {
        return { topSelectedItem: event.selectedItem };
      }),
      setBottomSelectedItem: assign((context, event: any) => {
        return { bottomSelectedItem: event.selectedItem };
      }),
    },
    guards: {
      isCorrect: context =>
        context.topSelectedItem.id === context.bottomSelectedItem.userId,
    },
  },
);
