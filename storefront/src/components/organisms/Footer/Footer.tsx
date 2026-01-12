import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"

export function Footer() {
  return (
    <footer className="bg-primary container">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Customer Services Column */}
        <div className="p-6 border rounded-sm hover:shadow-solarpunk-sm transition-shadow duration-300">
          <h2 className="heading-sm text-primary mb-3 uppercase">
            Customer services
          </h2>
          <nav className="space-y-3" aria-label="Customer services navigation">
            {footerLinks.customerServices.map(({ label, path }) => (
              <LocalizedClientLink
                key={label}
                href={path}
                className="block label-md hover:text-action transition-colors duration-200"
              >
                {label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        {/* Connect Column */}
        <div className="p-6 border rounded-sm hover:shadow-solarpunk-sm transition-shadow duration-300">
          <h2 className="heading-sm text-primary mb-3 uppercase">connect</h2>
          <nav className="space-y-3" aria-label="Social media navigation">
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={`Go to ${label} page`}
                title={`Go to ${label} page`}
                key={label}
                href={path}
                className="block label-md hover:text-action transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Solarpunk-styled footer bottom with gradient accent */}
      <div className="py-6 border rounded-sm relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-solarpunk" />
        <p className="text-md text-secondary text-center">© {new Date().getFullYear()} Black Market Coalition LLC</p>
      </div>
    </footer>
  )
}
