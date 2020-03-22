import { Machine, assign } from 'xstate';

interface IFetchStates {
  states: {
    idle: {};
    pending: {};
    failed: {};
    success: {};
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

export const fetchMachine = Machine<IFecthContext, IFetchStates, IFecthEvents>(
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
        entry: ['fetchData'],
        on: {
          RESOLVE: {
            target: 'success',
            actions: ['setResults'],
          },
          REJECT: {
            target: 'failed',
            actions: ['setMessage'],
          },
        },
      },
      failed: {
        on: {
          FETCH: 'pending',
        },
      },
      success: {
        on: {
          FETCH: 'pending',
        },
      },
    },
  },
  {
    actions: {
      setResults: assign((context, event: any) => ({ results: event.results })),
      setMessage: assign((context, event: any) => ({ message: event.message })),
    },
  },
);
