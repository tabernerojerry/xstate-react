import { Machine, assign } from 'xstate';

interface IFetchStatesSchema {
  states: {
    idle: {};
    pending: {};
    failed: {};
    success: {
      states: {
        unknown: {};
        withData: {};
        emptyData: {};
      };
    };
  };
}

interface IFecthContext {
  results: Array<any>;
  message: string;
}

type IFecthEvents =
  | { type: 'FETCH' }
  | { type: 'RESOLVE'; results: Array<any> }
  | { type: 'REJECT'; message: string };

export const fetchMachine = Machine<
  IFecthContext,
  IFetchStatesSchema,
  IFecthEvents
>(
  {
    id: 'fetchMachine',
    initial: 'idle',
    context: {
      results: [],
      message: '',
    },
    states: {
      idle: {
        on: {
          FETCH: 'pending',
        },
      },
      pending: {
        invoke: {
          src: 'fetchData',
          onDone: {
            target: 'success',
            actions: ['setResults'],
          },
          onError: {
            target: 'failed',
            actions: ['setMessage'],
          },
        },
      },
      success: {
        on: {
          FETCH: 'pending',
        },
        initial: 'unknown',
        states: {
          unknown: {
            on: {
              // Automatic transition
              '': [
                {
                  target: 'withData',
                  cond: 'hasData',
                },
                {
                  target: 'emptyData',
                },
              ],
            },
          },
          withData: {},
          emptyData: {},
        },
      },
      failed: {
        on: {
          FETCH: 'pending',
        },
      },
    },
  },
  {
    actions: {
      setResults: assign((_context, event: any) => {
        return { results: event.data };
      }),
      setMessage: assign((_context, event: any) => {
        return { message: event.data };
      }),
    },
    guards: {
      hasData: context => context.results.length > 0,
    },
  },
);
