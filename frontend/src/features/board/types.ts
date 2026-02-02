export type BoardCategory = "FREE" | "REVIEW";

export type BoardSummary = {
  id: string;
  title: string;

  authorName: string;
  authorId?: number;

  createdAt: string;
  preview: string;

  category?: BoardCategory;
};

export type BoardDetail = {
  id: string;
  title: string;
  content: string;

  authorName: string;
  authorId?: number;

  createdAt: string;
  updatedAt?: string;

  category?: BoardCategory;
  viewCount?: number;
  commentCount?: number;
  mediaUrls?: string[];
};

export type BoardCreateRequest = {
  title: string;
  content: string;
  category: BoardCategory;
  mediaUrls?: string[];
};

export type BoardUpdateRequest = {
  title: string;
  content: string;
  category?: BoardCategory;
  mediaUrls?: string[];
};
