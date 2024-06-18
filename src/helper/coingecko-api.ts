import axios from "axios";
import { config } from "../config";

const apiHander = axios.create({
  headers: {
    contentType: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  baseURL: config.COINGECKO_API_URL,
});

export const getCurrencyPrice = async (cy="FTM") => {
  const priceId = cy === "ETH" ? "ethereum" : "fantom";
  const currency = "usd";

  return apiHander
    .get("/simple/price", {
      params: {
        ids: priceId,
        vs_currencies: currency,
      },
    })
    .then((res) => {
      return res.data[priceId][currency];
    })
    .catch((err) => {
      console.error(err);
    });
};
