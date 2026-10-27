import { useState } from "react";
import {
  ChevronDown,
  FlaskConical,
  LibraryBig,
  Menu,
  PenLine,
  Play,
  Repeat,
  Code2,
  PackageOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
 * The three things the playground is for. Everything else is a tool you reach
 * for once you know you need it, and lives in the Tools menu.
 */
const primaryNavigation: NavItem[] = [
  { name: "Examples", href: "/examples", icon: LibraryBig, matches: ["/examples"] },
  {
    name: "Player",
    href: "/package",
    icon: Play,
    matches: ["/package", "/assessment"],
  },
  { name: "Editor", href: "/edit", icon: PenLine, matches: ["/edit", "/preview"] },
];

type ToolItem = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const tools: ToolItem[] = [
  {
    name: "Convert & modify package",
    description: "QTI 2.x ⇄ 3, strip media, pick items, export to Word or PDF",
    href: "/modify",
    icon: PackageOpen,
  },
  {
    name: "Convert item",
    description: "Paste one item and convert between QTI 2.x and QTI 3",
    href: "/convert",
    icon: Repeat,
  },
  {
    name: "XML preview",
    description: "Hand-edit QTI 3 XML next to a live player",
    href: "/preview",
    icon: Code2,
  },
];

/**
 * Kept apart from the tools above on purpose: the local-model import is a
 * best-effort experiment, and should read as one.
 */
const labs: ToolItem[] = [
  {
    name: "Local AI import",
    description: "Turn PDF, Word or Excel into QTI with an in-browser model",
    href: "/ai-convert",
    icon: FlaskConical,
  },
];

const isActive = (pathname: string, item: NavItem) =>
  item.matches.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

function ToolsMenu({ pathname }: { pathname: string }) {
  const toolActive = [...tools, ...labs].some((tool) => tool.href === pathname);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600",
          toolActive
            ? "text-citolab-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        Tools
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-1.5">
        {tools.map((tool) => (
          <ToolMenuItem key={tool.href} tool={tool} />
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Labs
        </DropdownMenuLabel>
        {labs.map((tool) => (
          <ToolMenuItem key={tool.href} tool={tool} experimental />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToolMenuItem({
  tool,
  experimental = false,
}: {
  tool: ToolItem;
  experimental?: boolean;
}) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer items-start gap-3 rounded-md p-2">
      <Link to={tool.href}>
        <tool.icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            experimental ? "text-gray-400" : "text-citolab-600",
          )}
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
            {tool.name}
            {experimental ? (
              <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Experimental
              </span>
            ) : null}
          </span>
          <span className="block text-xs leading-snug text-gray-500">
            {tool.description}
          </span>
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

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
        <div>
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Tools
          </p>
          {[...tools, ...labs].map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              onClick={onNavigate}
              className={linkClass(pathname === tool.href)}
            >
              <tool.icon className="h-4 w-4 text-gray-400" />
              {tool.name}
              {labs.includes(tool) ? (
                <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Experimental
                </span>
              ) : null}
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
                      "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-citolab-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="ml-auto hidden items-center gap-1 md:flex">
              <ToolsMenu pathname={pathname} />
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
