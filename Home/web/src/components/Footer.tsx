import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Icon name="sparkles" className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black">PixelLift</span>
        </div>
        <p className="text-sm text-white/40">© 2026 PixelLift. AI-powered room design.</p>
        <Link
          to="https://github.com"
          className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <Icon name="github" className="h-5 w-5" />
        </Link>
      </div>
    </footer>
  );
}
