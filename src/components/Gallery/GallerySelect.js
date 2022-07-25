import React, {  Component } from "react";
import { connect } from "react-redux";
import { fetchGalleries } from "../../redux/fetchGalleries";

import { List } from "antd";
import GalleryListItem from "./GalleryListItem";

class GallerySelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      loading: false,
    };
  }

  componentDidMount() {
    if (!this.props.galleries.length) {
      this.setState({ loading: true });
    }

    this.onListenForGalleries();
  }
  onListenForGalleries = () => {
    console.log("onListenForGalleries")
    this.props.fetchGalleries();
  };

  render () {
    const {galleries} = this.props;
    return (
        <List
          itemLayout="vertical"
          dataSource={galleries.list}
          renderItem={(data) => {
            return <GalleryListItem data={data} />;
          }}
        />
            
    );
  }

}

// ({ galleries, fetchGalleries}) => {
//   const [springProps, , stopSpringProps] = useSpring(() => ({
//     scroll: 1,
//   }));
//   useEffect(() => {
//     fetchGalleries();
//     console.log("GallerySelect fetch galleries");
//   }, []);
//   return (
//     <animated.div
//       scrollTop={springProps.scroll}
//       onWheel={stopSpringProps}
//       className="gallery-list-holder"
//     >
//       {
//         <List
//           itemLayout="vertical"
//           dataSource={galleries.list}
//           renderItem={(data) => {
//             return <GalleryListItem data={data} />;
//           }}
//         />
//       }
//     </animated.div>
//   );
// };

const mapStateToProps = (state) => {
  return {galleries:state.galleries};
};

export default connect(mapStateToProps, {fetchGalleries})(GallerySelect);
