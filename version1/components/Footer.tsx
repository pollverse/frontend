"use client";

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { siGithub, siX, siDiscord, siTelegram } from 'simple-icons/icons';

// Helper function to convert simple-icons to React components
interface IconProps {
  path: string;
  title?: string;
}

interface SimpleIconProps {
  icon: IconProps;
  size?: number | string;
  className?: string;
}

const SimpleIcon: React.FC<SimpleIconProps> = ({ 
  icon, 
  size = 24, 
  className = 'text-white bg-red-600 rounded-full p-2' 
}) => {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
};

const navigation = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Security', href: '#security' },
  ],
  resources: [
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
    { name: 'Tutorials', href: '#tutorials' },
    { name: 'Blog', href: '#blog' },
  ],
  community: [
    { name: 'Discord', href: '#discord' },
    { name: 'Forum', href: '#forum' },
    { name: 'GitHub', href: '#github' },
    { name: 'Support', href: '#support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          {/* Main footer content */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand section */}
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/NexaPoll.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                <span className="text-xl font-bold text-white">Pollverse</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-md">
                Empowering communities with transparent, decentralized governance. 
                Build, manage, and grow your DAO with confidence.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/yourusername/nexapoll" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <SimpleIcon icon={siGithub} className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <SimpleIcon icon={siX} className="w-5 h-5" />
                </a>
                <a 
                  href="https://discord.gg/yourinvite" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Discord"
                >
                  <SimpleIcon icon={siDiscord} className="w-5 h-5" />
                </a>
                <a 
                  href="https://t.me/yourchannel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <SimpleIcon icon={siTelegram} className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                    >
                      {item.name}
                      {(item.name === 'Documentation' || item.name === 'API Reference') && (
                        <ExternalLink className="w-3 h-3 ml-1" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Community
              </h3>
              <ul className="space-y-3">
                {navigation.community.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} NexaPoll. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-400">
              Built with for the decentralized future
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}