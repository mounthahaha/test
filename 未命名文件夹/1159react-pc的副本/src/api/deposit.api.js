import { createRequest } from "../utils/axios";

const API = {
  // 支付方式
  methods: {
    url: "/pc/payment/methods",
    method: 'get',
  },
  // 下单
  createOrder: {
    url: "/pc/usercentre/deposit/jcf",
    method: 'post',  
  },
};

export default createRequest(API);
