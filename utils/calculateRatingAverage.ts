import { Review } from "@prisma/client";

export const calculateRatingAverage = (reviews: Review[]) => {
  if (!reviews.length) return 0;

  return reviews.reduce((sum, review) => {
    return (sum + review.rating) / reviews.length;
  }, 0);
};
