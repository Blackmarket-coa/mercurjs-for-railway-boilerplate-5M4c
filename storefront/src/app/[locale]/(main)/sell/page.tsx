"use client"

import { useState } from "react"
import Link from "next/link"

// Inline SVG icons
const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CurrencyDollarIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserGroupIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
)

const ShieldCheckIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const HeartIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
)

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const ChartBarIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const VENDOR_PANEL_URL = process.env.NEXT_PUBLIC_VENDOR_PANEL_URL || "https://vendor.freeblackmarket.com"

/**
 * Sell on Free Black Market - Vendor Signup Landing Page
 * 
 * Designed following freeblackmarket.com conversion copy principles:
 * - Safety first messaging
 * - Radical transparency 
 * - Community over conversion
 */
export default function SellPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Integrate with actual signup API
    // For now, redirect to vendor panel register
    setTimeout(() => {
      window.location.href = `${VENDOR_PANEL_URL}/register?email=${encodeURIComponent(email)}`
    }, 500)
  }

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: "Keep 97% of Every Sale",
      description: "Our 3% platform fee is one of the lowest in the industry. No hidden fees, no monthly charges, no listing fees.",
    },
    {
      icon: UserGroupIcon,
      title: "Direct Customer Relationships",
      description: "Build real connections with your buyers. They're not just customers—they're community members who chose you.",
    },
    {
      icon: ShieldCheckIcon,
      title: "You Set Your Rules",
      description: "Set your own hours, minimum orders, delivery zones. Take vacations when you need them. This is your business.",
    },
    {
      icon: HeartIcon,
      title: "Community, Not Competition",
      description: "We're building a network where producers help each other. Share knowledge, coordinate deliveries, grow together.",
    },
    {
      icon: CalendarIcon,
      title: "Standing Orders & Subscriptions",
      description: "Build predictable income with recurring orders. Know what you're selling before you even harvest.",
    },
    {
      icon: ChartBarIcon,
      title: "Transparent Impact Metrics",
      description: "See exactly how your work impacts the community. Track your contribution to local food security.",
    },
  ]

  const producerTypes = [
    "Urban Farmers & Gardeners",
    "Home Bakers & Cooks",
    "Artisan Food Makers",
    "Beekeepers",
    "Mushroom Growers",
    "Preservers & Canners",
    "Fermenters",
    "Small-Scale Ranchers",
    "Wildcrafters & Foragers",
    "Aquaponic/Hydroponic Growers",
  ]

  const faqs = [
    {
      question: "How much does it cost to sell?",
      answer: "Nothing upfront. We take a 3% commission only when you make a sale. No monthly fees, no listing fees, no hidden charges. If you don't sell, you don't pay.",
    },
    {
      question: "Do I need a commercial kitchen?",
      answer: "It depends on your state's cottage food laws. Many states allow home-based food production for direct sales. We'll help you understand your local requirements during onboarding.",
    },
    {
      question: "How do I get paid?",
      answer: "We use Stripe Connect for secure, fast payments. You'll receive payouts directly to your bank account, typically within 2-3 business days of each sale.",
    },
    {
      question: "Can I set my own prices?",
      answer: "Absolutely. You know your costs, your time, and your worth. Set prices that let you thrive, not just survive.",
    },
    {
      question: "What if I can't fulfill an order?",
      answer: "Life happens. You can pause orders anytime, set vacation mode, and communicate directly with customers. We're not here to punish you—we're here to support you.",
    },
    {
      question: "Is this really different from other platforms?",
      answer: "Yes. We're producer-owned and operated. Our governance gives vendors voting rights. We don't compete with you, we work for you. When you succeed, we succeed—that's literally our business model.",
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/produce-pattern.svg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Sell What You Grow.
              <br />
              <span className="text-green-300">Keep What You Earn.</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
              Join a marketplace built by producers, for producers. 
              No middlemen taking half your profit. No algorithms hiding your products. 
              Just direct connections to people who value what you make.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                <span>3% Platform Fee</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                <span>No Monthly Fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                <span>You Own Your Data</span>
              </div>
            </div>

            {/* Signup Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? "Starting..." : "Start Selling"}
                </button>
              </form>
            ) : (
              <div className="bg-white/10 px-6 py-4 rounded-lg max-w-xl">
                <p className="text-green-200">
                  ✓ Check your email for next steps. We're excited to have you!
                </p>
              </div>
            )}
            
            <p className="mt-4 text-sm text-green-200">
              Free to join. No credit card required. Start selling in under 10 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built Different. Built for You.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This isn't another gig platform that sees you as a contractor. 
              We're building an economy where producers thrive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Sell Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                If You Make It, You Can Sell It
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Whether you have a backyard garden with extra tomatoes or you're running a 
                small farm, there's a place for you here. We believe everyone who produces 
                food deserves a dignified way to reach customers.
              </p>
              <div className="flex flex-wrap gap-3">
                {producerTypes.map((type, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-green-900 text-white p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4">The Math That Matters</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-green-700 pb-4">
                    <span>You sell a jar of honey for</span>
                    <span className="text-2xl font-bold">$15.00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-700 pb-4">
                    <span>Our platform fee (3%)</span>
                    <span className="text-xl text-green-300">-$0.45</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-700 pb-4">
                    <span>Payment processing (~2.9%)</span>
                    <span className="text-xl text-green-300">-$0.44</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl">You receive</span>
                    <span className="text-3xl font-bold text-green-300">$14.11</span>
                  </div>
                </div>
                <p className="mt-6 text-green-200 text-sm">
                  Compare that to farmers markets (often 30-40% in fees and time) or 
                  grocery stores (where producers see only 10-20% of the retail price).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Radical Transparency
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We believe you should know exactly how this platform works and where every dollar goes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">97%</div>
              <div className="text-xl mb-2">Goes to You</div>
              <p className="text-gray-400">
                The producer. The person who did the actual work.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">2%</div>
              <div className="text-xl mb-2">Platform Operations</div>
              <p className="text-gray-400">
                Servers, development, support, and making this all work.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">1%</div>
              <div className="text-xl mb-2">Community Fund</div>
              <p className="text-gray-400">
                Reinvested in producer grants, education, and local food access.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-300 max-w-2xl mx-auto">
              Unlike venture-backed platforms that burn cash to gain market share then raise fees, 
              we're building something sustainable. We don't have investors demanding growth at any cost. 
              We have producers who need a fair marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Questions? Honest Answers.
          </h2>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Sell on Your Terms?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join a growing community of producers who are building something different. 
            No contracts, no commitments, no catch. Just a fair marketplace.
          </p>
          
          <Link
            href={`${VENDOR_PANEL_URL}/register`}
            className="inline-block px-8 py-4 bg-white text-green-900 font-semibold rounded-lg hover:bg-green-50 transition-colors text-lg"
          >
            Create Your Producer Account
          </Link>
          
          <p className="mt-6 text-green-200">
            Already have an account?{" "}
            <Link href={`${VENDOR_PANEL_URL}/login`} className="underline hover:text-white">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
