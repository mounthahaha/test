import {  Form, Modal, Row, Col, Button  } from "antd";
import React, { useState, useImperativeHandle } from "react";



const ModalDetails = (props,ref) => {
  const [detail, setDetail] = useState({});
   
  let [isModalVisible, setisModalVisible] = useState(false);
  useImperativeHandle(ref, ()=>({
    changeModal:setisModalVisible,
    setInfoData:(data)=>{
      setDetail(data)
    }
  }))



  return (
    <Modal title="详情" visible={isModalVisible} footer={[]} onCancel={()=>setisModalVisible(false)}>
      <Form>
        {
          Object.entries(detail).map((el => {
            return <Form.Item
              label={el[0]}
              name={el[0]}
            >
              {el[1]}
            </Form.Item>
          }))
        }
      </Form>
    </Modal>
  )
};

export default ModalDetails;
