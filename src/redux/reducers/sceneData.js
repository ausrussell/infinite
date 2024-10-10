import { CREATE_SCENE_DATA, RESET_SCENE_DATA } from "../actionTypes";

const initialState = {
  floor: {},
  generalLight: {
    color: [1, 1, 1],
    intensity: 0.9,
  },
  sculptures: [],
  floorplan: {
    data: new Array(12).fill(new Array(12)),
    defaults: {
      wallWidth: 20,
      wallHeight: 100,
      wallDepth: 5,
    },
  },
  walls: [],
};

const wallDefaultDefaults = {
  wallWidth: 20,
  wallHeight: 60,
  wallDepth: 5,
};

const sceneData = function (state = initialState, action) {
  switch (action.type) {
    case CREATE_SCENE_DATA: {
      console.log("CREATE_SCENE_DATA state", action.payload, state);
      action.payload.floorplan.defaults = action.payload.floorplan.defaults || wallDefaultDefaults;
      return action.payload;
    }

    case RESET_SCENE_DATA: {
      // action.payload.floorplan.defaults = action.payload.floorplan.defaults || wallDefaultDefaults;
      return initialState;
    }

    default:
      return state;
  }
}

export default sceneData;