"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Package, Star } from "lucide-react";

type PlanKey = "BASIC" | "ASSISTED" | "PREMIUM";

const plans = [
  {
    key: "BASIC" as PlanKey,
    name: "Basic",
    price: "$4.99",
    description: "Publish one project on your own — straightforward and fast.",
    icon: Package,
    iconBg: "#E6F1FB",
    iconColor: "#378ADD",
    dotColor: "#B5D4F4",
    features: ["1 project listing", "Student applications", "Standard visibility"],
    featured: false,
  },
  {
    key: "ASSISTED" as PlanKey,
    name: "Assisted",
    price: "$14.99",
    description: "AI helps you write the project brief and recommends the best candidates.",
    icon: Briefcase,
    iconBg: "#E6F1FB",
    iconColor: "#378ADD",
    dotColor: "#378ADD",
    features: ["Everything in Basic", "AI project brief writer", "Recommended candidates"],
    featured: true,
  },
  {
    key: "PREMIUM" as PlanKey,
    name: "Premium",
    price: "$24.99",
    description: "Full support, top candidate access, and featured listing.",
    icon: Star,
    iconBg: "#E1F5EE",
    iconColor: "#1D9E75",
    dotColor: "#5DCAA5",
    features: ["Everything in Assisted", "Top candidates only", "Featured listing", "Priority support"],
    featured: false,
  },
];

export function Plans() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: PlanKey) => {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
          For businesses
        </p>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Find talent that fits your needs
        </h2>
        <span className="text-sm text-gray-500">
          One-time payment — no subscriptions, no hidden fees
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.key}
              className={`flex flex-col gap-5 rounded-2xl p-7 bg-white ${
                plan.featured
                  ? "border-2 border-blue-400"
                  : "border border-gray-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: plan.iconBg }}
                >
                  <Icon size={18} style={{ color: plan.iconColor }} />
                </div>
                {plan.featured && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                    Most popular
                  </span>
                )}
              </div>

              <div>
                <p className="font-semibold text-gray-900 text-base">{plan.name}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="font-mono text-3xl font-medium text-gray-900">
                {plan.price}{" "}
                <span className="text-sm font-sans font-normal text-gray-400">
                  / project
                </span>
              </div>

              <hr className="border-gray-100" />

              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: plan.dotColor }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border border-gray-200 text-gray-800 hover:bg-gray-50"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading === plan.key ? "Redirecting..." : "Get started"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}