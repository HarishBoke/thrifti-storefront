type PolaroidCard = {
  heading: string;
  imageSrc: string;
  imageAlt: string;
  caption: string;
  wrapperClassName: string;
  imageClassName: string;
  captionClassName: string;
};

type SellBuyRepeatSectionProps = {
  leftCard: PolaroidCard;
  centerCard: PolaroidCard;
  rightCard: PolaroidCard;
  stickerText?: string;
};

export default function SellBuyRepeatSection({
  leftCard,
  centerCard,
  rightCard,
  stickerText = "WITH THRIFTI",
}: SellBuyRepeatSectionProps) {
  return (
    <section className="container mx-auto bg-[var(--thrifti-cream)] px-4 pt-10 pb-18 sm:px-6 sm:pt-14 sm:pb-18 lg:w-[90%] lg:px-16 lg:py-20">
      <div className="mx-auto flex max-w-[255px] flex-col gap-4 sm:max-w-[300px] sm:gap-6 lg:mx-0 lg:max-w-none lg:flex-row lg:gap-4">
        <div className={leftCard.wrapperClassName}>
          <div className="vogue-font mb-1.5 text-3xl uppercase italic leading-none text-[var(--thrifti-dark)] lg:mb-3 lg:text-7xl">
            {leftCard.heading}
          </div>
          <div className="polaroid">
            <img src={leftCard.imageSrc} alt={leftCard.imageAlt} className={leftCard.imageClassName} />
            <p className={leftCard.captionClassName}>{leftCard.caption}</p>
          </div>
        </div>

        <div className={centerCard.wrapperClassName}>
          <div className="vogue-font mb-1.5 text-3xl uppercase not-italic leading-none text-[var(--thrifti-dark)] lg:mb-3 lg:text-7xl">
            {centerCard.heading}
          </div>
          <div className="polaroid">
            <img src={centerCard.imageSrc} alt={centerCard.imageAlt} className={centerCard.imageClassName} />
            <p className={centerCard.captionClassName}>{centerCard.caption}</p>
          </div>
        </div>

        <div className={rightCard.wrapperClassName}>
          <div className="vogue-font mb-1.5 text-3xl uppercase italic leading-none text-[var(--thrifti-dark)] lg:mb-3 lg:text-7xl">
            {rightCard.heading}
          </div>
          <div className="polaroid">
            <img src={rightCard.imageSrc} alt={rightCard.imageAlt} className={rightCard.imageClassName} />
            <div className="relative flex min-h-[2rem] items-end justify-center pb-2 lg:pb-1">
              <p className={rightCard.captionClassName}>{rightCard.caption}</p>
              <div className="anek-devanagari-font absolute right-[-20%] bottom-[-80%] flex shrink-0 rotate-[-13deg] items-center justify-center bg-[#F5F1EA] px-3.5 pt-1.5 pb-0 text-lg font-bold shadow-md lg:right-[-20%] lg:bottom-[-10%] lg:rotate-[-16deg] lg:px-4 lg:pt-2 2xl:text-2xl">
                {stickerText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
