import React from "react";

import fullStar from "@/public/icons/icons8-star-filled-24.png";
import halfStar from "@/public/icons/icons8-star-half-empty-30.png";
import emptyStar from "@/public/icons/icons8-star-32.png";
import Image from "next/image";
import { Review } from "@prisma/client";
import { calculateRatingAverage } from "@/utils/calculateRatingAverage";

const Stars = ({ reviews, rating }: { reviews: Review[]; rating?: number }) => {
  const r = rating || calculateRatingAverage(reviews);

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      let star;

      if (r >= i + 1) {
        star = fullStar;
      } else if (r >= i + 0.5) {
        star = halfStar;
      } else {
        star = emptyStar;
      }

      stars.push(star);
    }

    return stars.map((star, index) => (
      <Image key={index} src={star} alt="" className="w-4 h-4 mr-1" />
    ));
  };

  return <div className="flex items-center">{renderStars()}</div>;
};

export default Stars;
