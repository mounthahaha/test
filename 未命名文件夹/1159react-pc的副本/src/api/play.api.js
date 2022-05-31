import { createRequest } from "../utils/axios";

const API = {  
  gameUrl: {
    url: (params) => `/pc/game/${params.id}`,
  },
};

export default createRequest(API);
