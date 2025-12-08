"use client";

import { Plus, Zap, Users, Shield, BarChart2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export default function CreateDAOCTA() {

  const { isConnected } = useAppKitAccount();
  const route = useRouter();
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          {/* Animated background elements */}
          <motion.div
            className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-white/5 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Zap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                    Ready to Launch Your DAO?
                  </h2>
                </div>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Create a fully functional decentralized autonomous organization in minutes.
                  Equip your community with powerful governance tools, transparent voting,
                  and secure treasury management-all on the blockchain.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* <div className="relative inline-block"> */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        onClick={() => {
                          if (isConnected) {
                            route.push('/create-dao');
                          }
                        }}
                        disabled={!isConnected}
                        variant='default'
                        size='lg'
                        className='flex items-center gap-2 h-12 w-full bg-white text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your DAO Now
                      </Button>
                    </TooltipTrigger>
                    {!isConnected && (
                      <TooltipContent>
                        <p>Connect wallet to create DAO</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  {/* </div> */}
                  <Button
                    onClick={() => route.push('/about/#features')}
                    variant='outline'
                    size='lg'
                    className="flex items-center gap-2 h-12 bg-transparent hover:bg-transparent hover:text-white font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    How It Works
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-300" />
                    <span>Audited Smart Contracts</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-white/30"></div>
                  <div className="flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2 text-purple-300" />
                    <span>Advanced Analytics</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="hidden md:block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="font-bold text-xl mb-6 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-yellow-300" />
                    Why Choose NexaPoll?
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Shield className="w-5 h-5 text-green-300" />,
                        title: "Enterprise-Grade Security",
                        description: "Built on battle-tested smart contract standards with multiple security audits."
                      },
                      {
                        icon: <Users className="w-5 h-5 text-blue-300" />,
                        title: "Community Focused",
                        description: "Designed to empower communities with transparent decision-making tools."
                      },
                      {
                        icon: <Zap className="w-5 h-5 text-yellow-300" />,
                        title: "Lightning Fast",
                        description: "Low-latency voting and proposal management with instant finality."
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                            {item.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold text-white">{item.title}</h4>
                          <p className="text-blue-100 text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}