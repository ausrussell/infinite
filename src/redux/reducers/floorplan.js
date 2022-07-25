// let filledArray = new Array(10).fill('hello')

const defaultValues = {
    data: new Array(12).fill(new Array(12))
}

export default function (state = defaultValues, action) {
  console.log("floorplan reducer ", state, action)
  switch (action.type) {
    // case ADD_SCULPTURES: {
    //   return action.payload;
    // }
    // case ADD_SCULPTURE: {
    //     return [...state,action.payload];
    //   }
  
    default:
      return state;
  }
}