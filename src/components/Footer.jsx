import { Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#EFEEEB] px-8 py-8 md:py-14 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <span className="font-medium text-foreground">Get in touch</span>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/kysxu"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub: https://github.com/kysxu"
            className="text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <Github size={24} />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href="mailto:kysx.swp@gmail.com"
            title="Email: kysx.swp@gmail.com"
            className="text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <Mail size={24} />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
      <a href="/" className="hover:text-muted-foreground font-medium underline text-foreground">
        Home page
      </a>
    </footer>
  );
}