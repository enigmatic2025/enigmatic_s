
import { insightPostsEn } from "./insights-data-en";
import { insightPostsVi } from "./insights-data-vi";
import { insightPostsZhTw } from "./insights-data-zh-tw";
import { insightPostsEs } from "./insights-data-es";

export const getInsightPosts = (locale: string) => {
  switch (locale) {
    case "vi":
      return insightPostsVi;
    case "zh-TW":
      return insightPostsZhTw;
    case "es":
      return insightPostsEs;
    default:
      return insightPostsEn;
  }
};

// Backwards compatibility if needed, though we should migrate usages
export const insightPosts = insightPostsEn;
