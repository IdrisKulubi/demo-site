"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import type SwiperType from "swiper";
import { useEffect, useState, useRef } from "react";
import { Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  slug: string[];
  className?: string;
}

const ImageSlider = ({ slug, className }: ImageSliderProps) => {
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const imagesPreloaded = useRef<boolean>(false);

  const [slideConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (slug?.length ?? 0) - 1,
  });

  // Preload images for smoother transitions - Fixed Image constructor reference
  useEffect(() => {
    if (imagesPreloaded.current || !slug || slug.length === 0) return;
    
    console.log("Preloading images:", slug);
    
    // Use window.Image to explicitly reference the browser's Image constructor
    slug.forEach((url) => {
      if (url) {
        const img = new window.Image(); // Use window.Image instead of Image
        img.src = url;
      }
    });
    
    imagesPreloaded.current = true;
  }, [slug]);

  useEffect(() => {
    if (!swiper) return;

    const handleSlideChange = () => {
      setActiveIndex(swiper.activeIndex);
      setSlideConfig({
        isBeginning: swiper.activeIndex === 0,
        isEnd: swiper.activeIndex === (slug?.length ?? 0) - 1,
      });
    };

    swiper.on("slideChange", handleSlideChange);

    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [swiper, slug]);

  const activeStyles =
    "active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square h-8 w-8 z-50 place-items-center rounded-full border-2 bg-white border-zinc-300";
  const inactiveStyles = "hidden text-gray-400";

  // Create Swiper params object to properly configure Swiper
  const swiperParams = {
    pagination: {
      renderBullet: (_: number, className: string) => {
        return `<span class="rounded-full transition ${className}"></span>`;
      },
    },
    onSwiper: setSwiper,
    spaceBetween: 0,
    modules: [Pagination],
    slidesPerView: 1,
    speed: 300, // Faster slide transitions
    preloadImages: true,
    updateOnImagesReady: true
  };

  return (
    <div
      className={cn(
        "group relative bg-zinc-100 h-full w-full overflow-hidden rounded-xl",
        className
      )}
    >
      <div className="absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slideNext();
          }}
          className={cn(activeStyles, "right-3 transition", {
            [inactiveStyles]: slideConfig.isEnd,
            "hover:bg-primary-300 text-primary-800 opacity-100":
              !slideConfig.isEnd,
          })}
          aria-label="next image"
        >
          <ChevronRight className="h-4 w-4 text-zinc-700" />{" "}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slidePrev();
          }}
          className={cn(activeStyles, "left-3 transition", {
            [inactiveStyles]: slideConfig.isBeginning,
            "hover:bg-primary-300 text-primary-800 opacity-100":
              !slideConfig.isBeginning,
          })}
          aria-label="previous image"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-700" />{" "}
        </button>
      </div>

      <Swiper
        className="h-full w-full"
        {...swiperParams}
      >
        {slug?.map((url, i) => (
          <SwiperSlide key={i} className="relative h-full w-full">
            <div className="relative w-full h-full">
              <Image
                fill
                loading={i === 0 ? "eager" : "lazy"} // Load first image eagerly
                className="object-cover will-change-transform"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
                src={url}
                alt={`Profile image ${i + 1}`}
                quality={75}
                priority={i === 0} // Prioritize loading the first image
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
