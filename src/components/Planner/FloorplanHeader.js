import React, { useState, useEffect } from "react";
import PageTitle from "../Navigation/PageTitle";
import { Form, Row, Col, Input, Button } from "antd";
import * as BUTTONS from "./buttons";
import { withFirebase } from "../Firebase";
import { PlannerHelp } from "./PlannerHelp";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const FloorplanHeader = (props) => {
  const [form] = Form.useForm();
  const title = props.title || "";
  const [id, setId] = useState(props.id || "");

  useEffect(() => {
    console.log("useEffect", props);
    const updateFields = () => {
      setId(props.id);
      form.setFieldsValue(props, [props]);
    };
    updateFields(props);
  }, [props, form]);

  const onFinish = (values) => {
    console.log("values", values);
    const wallData = props.onSaveClickWallData();
    const plan = {
      title: values.title,
      data: wallData,
      timestamp: Date.now(),
    };

    if (!id) {
      pushToDatabase(plan);
    } else {
      const refPath =
        "users/" + props.firebase.currentUID + "/floorplans/" + id;
      props.firebase.updateAsset(refPath, plan);
    }
  };
  const pushToDatabase = (plan) => {
    const newPlan = props.firebase.storeFloorplan(plan);
    newPlan.then(() => {
      setId(newPlan.getKey());
    });
    // this.setState({ buildFloorKey: floorplanKey });
  };

  const rndBuild = () => {
    let rnd = parseInt(form.getFieldValue("rand"));
    if (!rnd) return;
    props.rnd(rnd)
  };

//   <Row gutter={[12, 12]}>
//   <Col span={12}>
//   <Form.Item 
//   name="rand">
//       <Input />
//     </Form.Item>
//   </Col>
//   <Col span={12}>
//     <Button onClick={() => rndBuild()}>Rnd build</Button>
//   </Col>
// </Row>

  return (
    <div className="page-header-area page-header-area-relative">
      <PageTitle title={"Floorplan"} help={PlannerHelp} />
      <Form {...layout} name="floorplan-editor" form={form} onFinish={onFinish}>
        <Row gutter={[12, 12]}>
          <Col span={15}>
            <Form.Item
              name="title"
              rules={[{ required: true }]}
              label="Title"
              style={{ backgroundColor: "#ffffff", padding: 6 }}
            >
              <Input placeholder="Title" />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {id ? `Update` : `Save`}
              </Button>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item>
              <Button onClick={() => props.reset()}>Reset</Button>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item>
              <BUTTONS.MainBuild plan={id} title={title} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default withFirebase(FloorplanHeader);
