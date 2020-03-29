import { Machine, assign } from 'xstate';

interface IMatchingStatesSchema {
  states: {
    quiz: {
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
            hist: {};
          };
        };
        verifying: {};
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
  | { type: 'CONTINUE' }
  | { type: 'CHANGE_ANSWERS' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

export const matchingMachine = Machine<
  IMatchingContext,
  IMatchingStatesSchema,
  TMatchingEvents
>(
  {
    id: 'matchingMachine',
    initial: 'quiz',
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined,
    },
    states: {
      quiz: {
        initial: 'answering',
        states: {
          answering: {
            type: 'parallel',
            on: {
              CONTINUE: {
                target: 'verifying',
                cond: 'questionsAnswered',
              },
            },
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
                    on: {
                      SELECT_TOP: {
                        target: 'selected',
                        actions: ['setTopSelectedItem'],
                      },
                    },
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
                    on: {
                      SELECT_BOTTOM: {
                        target: 'selected',
                        actions: ['setBottomSelectedItem'],
                      },
                    },
                  },
                },
              },
              hist: {
                type: 'history',
                history: 'deep',
              },
            },
          },
          verifying: {
            on: {
              CHANGE_ANSWERS: 'answering.hist',
              SUBMIT: '#submitted',
            },
          },
        },
      },
      submitted: {
        id: 'submitted',
        initial: 'evaluating',
        on: {
          RESET: {
            target: 'quiz',
            actions: ['clearSelections'],
          },
        },
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
        return {
          topSelectedItem: event.selectedItem
            ? event.selectedItem
            : context.topSelectedItem,
        };
      }),
      setBottomSelectedItem: assign((context, event: any) => {
        return {
          bottomSelectedItem: event.selectedItem
            ? event.selectedItem
            : context.bottomSelectedItem,
        };
      }),
      clearSelections: assign(() => ({
        topSelectedItem: undefined,
        bottomSelectedItem: undefined,
      })),
    },
    guards: {
      questionsAnswered: context =>
        context.topSelectedItem && context.bottomSelectedItem,
      isCorrect: context =>
        context.topSelectedItem.id === context.bottomSelectedItem.userId,
    },
  },
);
