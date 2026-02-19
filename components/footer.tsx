import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { locations } from "@/data/locations";

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/logo.png"
                                    alt="Biryani Factory Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="text-lg font-bold">Biryani Factory</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The authentic taste of Hyderabad, delivered to your doorstep. Experience the royal flavors in every bite.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                        </div>
                    </div>

                    {/* Locations */}
                    <div>
                        <h3 className="font-semibold mb-4">Our Kitchens</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {locations.map((location) => (
                                <li key={location.name} className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>{location.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                            <li><Link href="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link></li>
                            <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms and Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Get in Touch</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>
                                    Headquarters:<br />
                                    Anna Rao Circle, Tirupati,<br />
                                    Andhra Pradesh 517501
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+91 8686451406</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>support@biryanifactory.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Biryani Factory. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
