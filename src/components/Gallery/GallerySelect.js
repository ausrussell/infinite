import { useEffect } from "react";
import { connect } from "react-redux";
import { fetchGalleries } from "../../redux/fetchGalleries";
import { List } from "antd";
import GalleryListItem from "./GalleryListItem";

const GallerySelect = ({ galleries, fetchGalleries }) => {
  useEffect(() => {
    fetchGalleries();
  }, []);

  return (
    <div className="gallery-list-holder">
    <List
      itemLayout="vertical"
      dataSource={galleries.list}
      renderItem={(data) => {
        return <GalleryListItem data={data} />;
      }}
    />
    </div>
  );
};

const mapStateToProps = (state) => {
  return { galleries: state.galleries };
};

export default connect(mapStateToProps, { fetchGalleries })(GallerySelect);
