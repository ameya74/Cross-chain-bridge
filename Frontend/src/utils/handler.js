import axios from "axios";
import { ErrorToast } from "./helper";

export const api = (method, data, url) => {
  axios.defaults.baseURL = "http://localhost:8081/";

  return new Promise((resolve) => {
    axios({
      method,
      url,
      data,
    })
      .then((res) => {
        resolve(res);
        if (!res?.data?.success) {
          ErrorToast({ msg: res.data.error });
        }
      })
      .catch((err) => {
        resolve(err.response);

        // if found 500 or greate error status
        if (err?.response?.status >= 500) {
          ErrorToast({
            msg: "Ooops something went wrong. Please try again after some time!",
          });
        } else {
          // if found 400 error
          ErrorToast({ msg: err?.response?.data?.msg });
        }
      });
  });
};