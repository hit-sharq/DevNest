import { TrendingUp, Instagram, Twitter, Facebook } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-card border-t py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">DevNest</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              The most trusted Instagram growth platform for creators and businesses worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition-colors block py-1">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition-colors block py-1">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition-colors block py-1">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition-colors block py-1">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted">© 2024 DevNest. All rights reserved.</p>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted hover:text-foreground">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted hover:text-foreground">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted hover:text-foreground">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
