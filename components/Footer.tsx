import Link from "next/link";
import { MessageSquare, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span className="font-bold">ChatApp</span>
          </div>
          <p className="text-muted-foreground">
            Connect with your community through real-time chat.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/yourusername/chatapp"
              target="_blank"
            >
              <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Product</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/features" className="hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Company</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Legal</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ChatApp. All rights reserved.
      </div>
    </footer>
  );
}
