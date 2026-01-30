export type BoardSummary = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  preview?: string;
};

export type BoardDetail = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
};

export type BoardCreateRequest = {
  title: string;
  content: string;
  category?: string;
};

export type BoardUpdateRequest = {
  title: string;
  content: string;
  category?: string;
};
