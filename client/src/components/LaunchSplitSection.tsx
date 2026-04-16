import { Link } from "wouter";
import type { ReactNode } from "react";

type LaunchSplitSectionProps = {
  pretitle: string;
  title: ReactNode;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt?: string;
};

export default function LaunchSplitSection({
  pretitle,
  title,
  description,
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt = "Section visual",
}: LaunchSplitSectionProps) {
  return (
    <section className="bg-[var(--thrifti-red)]">
      <div className="container mx-auto flex flex-col lg:min-h-[430px] lg:flex-row">
        <div className="flex w-full flex-col justify-center px-7 py-10 sm:px-10 lg:w-[40%] lg:px-12 lg:py-12">
          <p className="anek-devanagari-font mb-1 text-base font-medium uppercase tracking-[0.16em] text-white lg:font-bold 2xl:text-xl">
            {pretitle}
          </p>
          <h2 className="vogue-font mb-6 text-[32px] uppercase leading-tight text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            {title}
          </h2>
          <p className="geist-mono-font mb-10 text-base font-medium leading-relaxed text-white lg:mb-8 lg:w-[35ch] lg:text-lg">
            {description}
          </p>
          <Link href={ctaHref}>
            <button className="thrifti-btn-dark text-2xl">{ctaLabel}</button>
          </Link>
        </div>
        <div className="w-full lg:w-[60%]">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="block h-[300px] w-full object-cover sm:h-[360px] lg:h-[700px]"
          />
        </div>
      </div>
    </section>
  );
}
