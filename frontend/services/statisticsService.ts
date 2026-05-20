import apiClient from "./api";
import { StatisticsResponse } from "@/types";

export const statisticsService = {
  getMyStatistics: async (): Promise<StatisticsResponse> => {
    const response = await apiClient.get<StatisticsResponse>("/statistics/me");
    return response.data;
  },
};
