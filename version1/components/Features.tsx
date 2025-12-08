"use client";

import { 
  Zap, 
  Wallet, 
  Vote, 
  Shield, 
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Create DAOs Instantly",
    description: "Launch your decentralized autonomous organization with just a few clicks. Configure governance parameters, token settings, and treasury management.",
    color: "text-blue-600 bg-blue-100"
  },
  {
    icon: Vote,
    title: "Democratic Governance",
    description: "Create and vote on proposals with rich metadata. Support for timelock delays, quorum requirements, and transparent decision-making.",
    color: "text-green-600 bg-green-100"
  },
  {
    icon: Wallet,
    title: "Treasury Management", 
    description: "Secure multi-asset treasury with ETH and token support. Withdrawal proposals require community approval through governance votes.",
    color: "text-purple-600 bg-purple-100"
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Built on battle-tested OpenZeppelin contracts with timelock protection, role-based permissions, and transparent execution.",
    color: "text-red-600 bg-red-100"
  }
];


export default function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to run a DAO
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            From creation to governance to treasury management, our platform provides all the tools 
            necessary for effective decentralized organization management.
          </p>
        </div>

        {/* Main features grid */}
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-200 h-full">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-6`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-7">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}