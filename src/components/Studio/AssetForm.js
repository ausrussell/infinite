import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, Button, DatePicker } from "antd";
import moment from "moment";
import RightsDropdown from "./RightsDropdown";
import RteAntWrapper from "../Rte";

const { TextArea } = Input;
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const yearFormat = "YYYY";

const AssetForm = (props) => {
  const [item, setItem] = useState(props.item);

  const { saveToDb, saving, firebase } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    const updateFields = () => {
      let newYear = moment(props.item.year || moment().format("YYYY"), "YYYY");
      const fieldsValues = Object.assign(props.item, { year: newYear });
      form.resetFields();
      form.setFieldsValue(fieldsValues);
      setItem(props.item);
    };
    updateFields();
  }, [form, props.item, props.item.updateTime]);

  const onFinish = (fieldsValues) => {
    fieldsValues.year = fieldsValues.year.format("YYYY");
    Object.keys(fieldsValues).forEach((key) => {
      fieldsValues[key] = fieldsValues[key] || null;
    });
    console.log("fieldsValues", fieldsValues);
    saveToDb(fieldsValues);
  };

  const itemBorrowedContent = ({ galleryTitle, borrowed }) => {
    return (
      <div>
        <Form.Item>
          Borrowed from gallery <strong>{galleryTitle}</strong> on {borrowed}
        </Form.Item>

        <Form.Item name="borrowersComment" label="Your comment:">
          <TextArea rows={4} />
        </Form.Item>
      </div>
    );
  };

  return (
    <Form
      {...layout}
      // name="uploadForm"
      name="asset-editor"
      form={form}
      onFinish={onFinish}
      initialValues={{
        artist: item.artist || firebase.currentUser.displayName,
        description2: {
          value: item.description2,
        },
      }}
    >
      {item.borrowed && itemBorrowedContent(item)}

      <Form.Item label="Asset Title" name="title">
        <Input placeholder="Title" disabled={item.borrowed} />
      </Form.Item>
      {!item.borrowed && (
        <Form.Item name="shareable" valuePropName="checked">
          <Checkbox>
            Allow others to borrow this for their own Hangar gallery
          </Checkbox>
        </Form.Item>
      )}
      {item.type.toLowerCase() === "art" && (
        <RightsDropdown license={item.license} />
      )}
      <Form.Item name="artist" label="Artist">
        <Input type="text" disabled={item.borrowed} />
      </Form.Item>
      <Form.Item name="media" label="Medium/Media">
        <Input type="text" disabled={item.borrowed} />
      </Form.Item>
      {item.borrowed ? (
        <Form.Item name="description" label="Description">
          <TextArea rows={4} disabled />
        </Form.Item>
      ) : (
        <Form.Item name="description" label="Description">
          <RteAntWrapper desc={item.description} />
        </Form.Item>
      )}
      <Form.Item label="Year" name="year">
        <DatePicker
          picker="year"
          format={yearFormat}
          defaultValue={moment(item.year || moment().format("YYYY"), "YYYY")}
          disabled={item.borrowed}
        />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" loading={saving}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AssetForm;
