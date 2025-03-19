import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, FileCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TestAutoPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              Login
            </Link>
            <Button asChild size="sm">
              <Link to="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Software Testing <span className="text-primary">Simplified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Automate your manual and Selenium testing workflows with our
            powerful, easy-to-use platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link to="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900">
            Powerful Testing Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Manual Test Management
              </h3>
              <p className="text-slate-600">
                Create, organize, and execute manual test cases with ease. Track
                results and generate comprehensive reports.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Selenium Automation
              </h3>
              <p className="text-slate-600">
                Build and manage Selenium scripts directly in your browser. No
                complex setup required.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Chrome Extension</h3>
              <p className="text-slate-600">
                Record and run tests directly from your browser with our
                powerful Chrome extension.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to streamline your testing?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Join thousands of QA professionals who have transformed their
            testing process.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link to="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">TestAutoPilot</span>
            </div>
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} TestAutoPilot. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
