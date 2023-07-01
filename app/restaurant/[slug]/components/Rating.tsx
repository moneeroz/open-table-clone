import { calculateRatingAverage } from "@/utils/calculateRatingAverage";
import { Review } from "@prisma/client";

const Rating = ({ reviews }: { reviews: Review[] }) => {
  const rating = calculateRatingAverage(reviews);

  return (
    <div className="flex items-end">
      <div className="ratings mt-2 flex items-center">
        <p>*****</p>
        <p className="text-reg ml-3">{rating.toFixed(1)}</p>
      </div>
      <div>
        <p className="text-reg ml-4">
          {reviews.length} Review{reviews.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
};

export default Rating;
