import Image from "next/image"

import tailwindConfig from "../../../../tailwind.config"
import { ArrowRightIcon } from "@/icons"
import Link from "next/link"

type HeroProps = {
  image: string
  heading: string
  paragraph: string
  buttons: { label: string; path: string }[]
  /** Mission-first variant: minimal, text-forward above-the-fold */
  variant?: "default" | "mission"
}

export const Hero = ({ image, heading, paragraph, buttons, variant = "default" }: HeroProps) => {
  // Mission-first variant: clean, values-focused above the fold
  if (variant === "mission") {
    return (
      <section className="w-full min-h-[60vh] flex flex-col justify-center px-6 lg:px-12 bg-gradient-to-br from-amber-50 via-white to-green-50">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-warm-900 leading-tight">
            {heading}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-600 max-w-xl leading-relaxed">
            {paragraph}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {buttons.map(({ label, path }, idx) => (
              <Link
                key={path}
                href={path}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  idx === 0
                    ? "bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-xl"
                    : "bg-white text-green-800 border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                {label}
                <ArrowRightIcon
                  color={idx === 0 ? "#fff" : tailwindConfig.theme.extend.backgroundColor.primary}
                  className="w-4 h-4"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default variant: image-forward layout
  return (
    <section className="w-full flex container mt-5 flex-col lg:flex-row text-primary">
      <Image
        src={decodeURIComponent(image)}
        width={700}
        height={600}
        alt={`Hero banner - ${heading}`}
        className="w-full order-2 lg:order-1"
        priority
        fetchPriority="high"
        quality={50}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="w-full lg:order-2">
        <div className="border rounded-sm w-full px-6 flex items-end h-[calc(100%-144px)]">
          <div>
            <h2 className="font-bold mb-6 uppercase display-md max-w-[652px] text-4xl md:text-5xl leading-tight">
              {heading}
            </h2>
            <p className="text-lg mb-8">{paragraph}</p>
          </div>
        </div>
        {buttons.length && (
          <div className="h-[72px] lg:h-[144px] flex font-bold uppercase">
            {buttons.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className="group flex border rounded-sm h-full w-1/2 bg-content hover:bg-action hover:text-tertiary transition-all duration-300 p-6 justify-between items-end"
                aria-label={label}
                title={label}
              >
                <span>
                  <span className="group-hover:inline-flex hidden">#</span>
                  {label}
                </span>

                <ArrowRightIcon
                  color={tailwindConfig.theme.extend.backgroundColor.primary}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
