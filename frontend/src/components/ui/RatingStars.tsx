import React from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = interactive ? hoverRating ?? rating : rating;
  const roundedRating = Math.round(displayRating * 2) / 2;

  return (
    <div
      className={`flex gap-1 ${interactive ? 'cursor-pointer' : ''} ${className}`}
      role="img"
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = roundedRating >= starValue;
        const isHalfFilled = roundedRating === starValue - 0.5;

        return (
          <button
            key={index}
            onClick={() => {
              if (interactive && onRate) {
                onRate(starValue);
              }
            }}
            onMouseEnter={() => {
              if (interactive) setHoverRating(starValue);
            }}
            onMouseLeave={() => {
              if (interactive) setHoverRating(null);
            }}
            className={`
              ${sizeMap[size]}
              transition-transform duration-200
              ${interactive ? 'hover:scale-110' : ''}
            `}
            type="button"
            aria-label={`Rate ${starValue} stars`}
            disabled={!interactive}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFilled ? '#F59E0B' : 'none'}
              stroke={isFilled || isHalfFilled ? '#F59E0B' : '#D1D5DB'}
              strokeWidth="2"
              className="w-full h-full"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
