import { useState } from "react";
import { Menu, Sparkles, X, type LucideIcon } from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CitolabLogo } from "./components/citolab-logo";

type NavItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
};

const packageNavigation: NavItem[] = [
  { name: "Preview package", href: "/upload" },
  { name: "Convert", href: "/ai-convert", icon: Sparkles },
  { name: "Modify packages", href: "/modify" },
];

const itemNavigation: NavItem[] = [
  { name: "Preview item", href: "/preview" },
  { name: "Convert item", href: "/convert" },
];

const navigationGroups = [
  { label: "Package", items: packageNavigation },
  { label: "Item", items: itemNavigation },
];

const navLinkClassName = ({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) =>
  cn(
    "rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150",
    isPending
      ? "text-citolab-600"
      : isActive
        ? "bg-citolab-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-white hover:text-citolab-700",
  );

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.href} className={navLinkClassName}>
      <span className="inline-flex items-center gap-1.5">
        {item.icon ? <item.icon className="h-3.5 w-3.5 shrink-0" /> : null}
        {item.name}
      </span>
    </NavLink>
  );
}

function DesktopNavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-0.5 rounded-full border border-gray-200/80 bg-gray-50/90 p-0.5">
        {items.map((item) => (
          <NavItemLink key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

function BrandLogo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 shrink-0 items-center rounded-md text-citolab-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
      aria-label="CitoLab home"
    >
      <CitolabLogo className="h-7 w-[4.5rem]" />
    </button>
  );
}

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fullScreen = searchParams.get("full")?.toLocaleLowerCase() === "true";

  return (
    <div className="bg-gray-100 flex flex-col h-full">
      {!fullScreen ? (
        <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="flex h-14 w-full items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <BrandLogo onClick={() => navigate("/")} />

            <div className="hidden md:block h-6 w-px bg-gray-200 shrink-0" />

            <div className="hidden md:flex min-w-0 flex-1 items-center justify-start gap-3 overflow-x-auto lg:gap-5">
              {navigationGroups.map((group, index) => (
                <div key={group.label} className="flex items-center gap-3 lg:gap-5">
                  {index > 0 ? (
                    <div className="h-6 w-px bg-gray-200 shrink-0" />
                  ) : null}
                  <DesktopNavGroup label={group.label} items={group.items} />
                </div>
              ))}
            </div>

            <div className="ml-auto flex md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-citolab-50 hover:text-citolab-700"
                  onClick={() => setMobileOpen((open) => !open)}
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              </div>
          </div>

          <div className="h-0.5 bg-linear-to-r from-citolab-600 via-citolab-teal-500 to-citolab-teal-700" />

          {mobileOpen ? (
            <div className="md:hidden border-t border-gray-100">
              <div className="space-y-4 px-3 pb-3 pt-2 bg-white">
                {navigationGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-citolab-50 text-citolab-700 border-l-2 border-citolab-600"
                                : "text-gray-600 hover:bg-citolab-50 hover:text-citolab-700",
                            )
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            {item.icon ? (
                              <item.icon className="h-4 w-4" />
                            ) : null}
                            {item.name}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </nav>
      ) : null}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
};
