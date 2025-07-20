'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-muted/50 border-t mt-auto',
      className
    )}>
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">B2B Shipping</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional shipping solutions for businesses. Fast, reliable, and transparent pricing.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={"/shipping" as any} className="hover:text-foreground transition-colors">
                  Ground Shipping
                </Link>
              </li>
              <li>
                <Link href={"/shipping" as any} className="hover:text-foreground transition-colors">
                  Air Express
                </Link>
              </li>
              <li>
                <Link href={"/shipping" as any} className="hover:text-foreground transition-colors">
                  Freight Services
                </Link>
              </li>
              <li>
                <Link href={"/shipping" as any} className="hover:text-foreground transition-colors">
                  Pickup Scheduling
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={"/help" as any} className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={"/tracking" as any} className="hover:text-foreground transition-colors">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href={"/contact" as any} className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={"/terms" as any} className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>1-800-SHIP-NOW</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>support@b2bshipping.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>24/7 Customer Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} B2B Shipping System. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href={"/privacy" as any} className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href={"/terms" as any} className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <Link href={"/cookies" as any} className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
