"use client";

import { Sparkles, Github, BookOpen, ArrowRight, Zap, Users, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const stats = [
  { value: '50+', label: 'Active DAOs', icon: <Zap className="w-5 h-5" /> },
  { value: '10K+', label: 'Community Members', icon: <Users className="w-5 h-5" /> },
  { value: '$5M+', label: 'Assets Under Management', icon: <BarChart2 className="w-5 h-5" /> },
];

const resources = [
  {
    title: 'Documentation',
    description: 'Complete guides and API reference to help you build and manage your DAO effectively.',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    url: 'https://github.com/DIFoundation/NexaPoll/blob/main/README.md',
  },
  {
    title: 'Open Source',
    description: 'Explore our smart contracts and frontend code. Contribute to the future of DAOs.',
    icon: <Github className="w-6 h-6 text-white" />,
    url: 'https://github.com/DIFoundation/NexaPoll',
  },
  {
    title: 'Community',
    description: 'Join our Discord and connect with other DAO builders and governance enthusiasts.',
    icon: <Sparkles className="w-6 h-6 text-white" />,
    url: 'https://x.com/nexapoll',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CTASection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/create-dao');
  };

  return (
    <section className="relative py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(80px)',
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
              opacity: Math.random() * 0.1 + 0.05,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Main CTA */}
          <motion.div 
            className="mb-16"
            variants={fadeInUp}
          >
            <motion.div 
              className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white mb-8 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Join the future of governance
            </motion.div>
            
            <motion.h2 
              className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
              variants={fadeInUp}
            >
              Start Building Your DAO Today
            </motion.h2>
            
            <motion.p 
              className="mx-auto max-w-3xl text-xl text-blue-100 mb-10 leading-8"
              variants={fadeInUp}
            >
              Take control of your community&apos;s future with transparent, decentralized governance. 
              Connect your wallet and launch your first DAO in minutes.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-indigo-600 bg-white rounded-full group-hover:bg-gradient-to-br from-white to-blue-100 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <span className="relative text-lg font-semibold">
                  Get Started Now
                  <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Stats section */}
          <motion.div 
            className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-16"
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 text-blue-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Resource links */}
          <motion.div 
            className="border-t border-white/20 pt-16"
            variants={fadeInUp}
          >
            <motion.h3 
              className="text-2xl font-semibold text-white mb-12"
              variants={fadeInUp}
            >
              Resources to Get Started
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-4 group-hover:bg-white/20 transition-colors">
                      {resource.icon}
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-3">{resource.title}</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-300 text-sm font-medium group-hover:text-white transition-colors">
                      Learn more
                      <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final message */}
          <motion.div 
            className="mt-24 pt-16 border-t border-white/10 relative"
            variants={fadeInUp}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              Ready to get started?
            </div>
            <motion.p 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              The future of governance starts with you.
            </motion.p>
            <motion.button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative text-lg font-semibold">
                Launch Your DAO Now
                <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}