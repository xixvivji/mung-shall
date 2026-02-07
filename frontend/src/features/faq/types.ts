export type Faq = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFaqRequest = {
  question: string;
  answer: string;
};

export type UpdateFaqRequest = {
  question: string;
  answer: string;
};

export type PageResult<T> = {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};
