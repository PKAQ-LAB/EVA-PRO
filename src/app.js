const initialState = {};

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
    },
  },
  initialState,
  onReducer(reducer) {
    return (state, action) => {
      const newState = action.type === 'RESET' ? initialState : reducer(state, action);
      return { ...newState, routing: newState.routing };
    };
  },
};

export function render(oldRender) {
  oldRender();
}
