import axios, { AxiosHeaders } from "axios";

const _axios = axios.create({
  //   baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL,
});

// 请求拦截器
_axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    config.headers = new AxiosHeaders({
      Authorization: token || ''
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
_axios.interceptors.response.use(
  (response) => {
    // 2xx
    return response;
  },
  (error) => {
    // 4xx or 5xx
    console.log(error);
    
    // 如果是401错误，说明token无效或过期，需要重新登录
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.resolve(error.response);
  }
);

export default _axios;
