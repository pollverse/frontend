"use client";

import { Sparkles, Github, BookOpen } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 bg-linear-to-r from-blue-600 to-indigo-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-16">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white mb-8">
              <Sparkles className="mr-2 h-4 w-4" />
              Join the future of governance
            </div>
            
            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
              Start Building Your DAO Today
            </h2>
            
            <p className="mx-auto max-w-3xl text-xl text-blue-100 mb-10 leading-8">
              Take control of your community&apos;s future with transparent, decentralized governance. 
              Connect your wallet and launch your first DAO in minutes.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-colors duration-200">
                Connect Wallet & Start
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center rounded-lg border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-colors duration-200">
                Explore DAOs
              </button>
            </div> */}
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-200">Active DAOs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-200">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$5M+</div>
              <div className="text-blue-200">Assets Under Management</div>
            </div>
          </div>

          {/* Resource links */}
          <div className="border-t border-white/20 pt-12">
            {/* <h3 className="text-xl font-semibold text-white mb-8">
              Resources to Get Started
            </h3> */}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Documentation */}
              <div 
               className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer" 
               onClick={() => window.open('https://github.com/DIFoundation/NexaPoll/blob/main/README.md', '_blank')}>
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Documentation</h4>
                <p className="text-blue-100 text-sm">
                  Complete guides and API reference to help you build and manage your DAO effectively.
                </p>
              </div>

              {/* GitHub */}
              <div 
               className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer" 
               onClick={() => window.open('https://github.com/DIFoundation/NexaPoll', '_blank')}>
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Open Source</h4>
                <p className="text-blue-100 text-sm">
                  Explore our smart contracts and frontend code. Contribute to the future of DAOs.
                </p>
              </div>

              {/* Community */}
              <div 
               className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer" 
               onClick={() => window.open('https://x.com/nexapoll', '_blank')}>
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Community</h4>
                <p className="text-blue-100 text-sm">
                  Join our Discord and connect with other DAO builders and governance enthusiasts.
                </p>
              </div>
            </div>
          </div>

          {/* Final message */}
          <div className="mt-16 border-t border-white/20 pt-12">
            <p className="text-blue-100 text-lg">
              Ready to revolutionize how your community makes decisions?
            </p>
            <p className="text-white font-semibold text-xl mt-2">
              The future of governance starts with you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}