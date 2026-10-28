import { useEffect, useState } from "react";
import {
  Menu,
  PenLine,
  Play,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CitolabLogo } from "./components/citolab-logo";
import { GithubMark } from "./components/github-mark";
import { PAGE_CONTAINER, PAGE_GUTTER } from "./components/page-shell";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Other routes that belong to this destination, so it stays highlighted there. */
  matches: string[];
};

/**
 * The two things the playground is for, plus Tools: everything you reach for
 * once you know you need it. The Tools page lists them, together with the
 * libraries and CLIs that live outside the playground.
 */
const primaryNavigation: NavItem[] = [
  {
    name: "Assessment player",
    href: "/assessment-player",
    icon: Play,
    matches: ["/assessment-player", "/assessment"],
  },
  { name: "Editor", href: "/edit", icon: PenLine, matches: ["/edit", "/preview"] },
  {
    name: "Tools",
    href: "/tools",
    icon: Wrench,
    matches: ["/tools", "/modify", "/convert", "/ai-convert"],
  },
];

/**
 * The browser tab title per route, which is also what search results show. The
 * player's says "assessment player" because that is what people search for.
 */
const SITE_TITLE = "QTI Playground";
const pageTitles: { prefix: string; title: string }[] = [
  { prefix: "/assessment-player", title: "QTI assessment player" },
  { prefix: "/assessment", title: "QTI assessment player" },
  { prefix: "/edit", title: "QTI item editor" },
  { prefix: "/preview", title: "QTI XML editor" },
  { prefix: "/tools", title: "QTI tools" },
  { prefix: "/modify", title: "Modify a QTI package" },
  { prefix: "/convert", title: "Convert QTI 2.x to QTI 3" },
  { prefix: "/ai-convert", title: "Convert documents to QTI" },
];

function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const page = pageTitles.find(
      ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    document.title = page
      ? `${page.title} · ${SITE_TITLE}`
      : `${SITE_TITLE} · Open-source QTI 3 assessment player and editor`;
  }, [pathname]);
}

const isActive = (pathname: string, item: NavItem) =>
  item.matches.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

function MobileMenu({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
      active
        ? "bg-citolab-50 text-citolab-800"
        : "text-gray-700 hover:bg-gray-50",
    );

  return (
    <div className="border-t border-gray-100 bg-white md:hidden">
      <div className={cn(PAGE_GUTTER, "space-y-4 py-3")}>
        <div className="space-y-0.5">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={linkClass(isActive(pathname, item))}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
        <a
          href="https://github.com/Citolab"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass(false)}
        >
          <GithubMark className="h-4 w-4 text-gray-400" />
          CitoLab on GitHub
        </a>
      </div>
    </div>
  );
}

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  useDocumentTitle(pathname);
  const fullScreen = searchParams.get("full")?.toLocaleLowerCase() === "true";

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {!fullScreen ? (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
          <div
            className={cn(
              PAGE_CONTAINER,
              PAGE_GUTTER,
              "flex h-16 items-center gap-6",
            )}
          >
            <Link
              to="/"
              className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-citolab-600"
              aria-label="QTI Playground by CitoLab, home"
            >
              <CitolabLogo className="h-7 w-[4.5rem] text-citolab-600" />
              <span className="hidden h-6 w-px bg-gray-200 sm:block" />
              <span className="hidden font-display text-[15px] font-semibold tracking-tight text-gray-900 sm:block">
                QTI Playground
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {primaryNavigation.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-citolab-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    {/* Below lg the labels alone only just fit next to the logo. */}
                    <item.icon className="hidden h-4 w-4 lg:block" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="ml-auto hidden items-center gap-1 md:flex">
              <a
                href="https://github.com/Citolab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="CitoLab on GitHub"
                aria-label="CitoLab on GitHub"
              >
                <GithubMark className="h-[18px] w-[18px]" />
              </a>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileOpen ? (
            <MobileMenu
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          ) : null}
        </nav>
      ) : null}
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};
