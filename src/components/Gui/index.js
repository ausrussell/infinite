// import * as Stats from "stats-js";
// import * as dat from "dat.gui";

// export const gui = () => {
// this.stats = new Stats();
// this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(this.stats.dom);
// }
//       // this.gui = new dat.GUI();


      //  stats={this.stats} gui={this.gui} 

      import GuiContext, { withGui } from "./context";

      import Gui from "./gui";
      
      export default Gui;
      
      export { GuiContext, withGui };      
