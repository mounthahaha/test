import { createRequest } from "../utils/axios";

const API = {  
  help: {
    url: "/pc/helper",    
  },  
  helpDetail: {
    url: (params) => `/pc/helper/${params.code}`, 
  },
};

export default createRequest(API);
