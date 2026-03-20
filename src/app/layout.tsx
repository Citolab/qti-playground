import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Preview Package", href: "/upload" },
  { name: "Upgrade / modify packages", href: "/modify" },
  { name: "Preview item", href: "/preview" },
  { name: "Convert item", href: "/convert" },
];

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fullScreen = searchParams.get("full")?.toLocaleLowerCase() === "true";

  return (
    <div className="bg-gray-100 flex flex-col h-full">
      {!fullScreen ? (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-6">
              {/* Logo */}
              <div
                className="shrink-0 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <img
                  className="block h-10 w-auto"
                  src="/citolab.jpeg"
                  alt="CitoLab"
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block h-6 w-px bg-gray-200" />

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1 flex-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive, isPending }) =>
                      cn(
                        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                        isPending
                          ? "text-citolab-600"
                          : isActive
                            ? "bg-citolab-600 text-white shadow-sm"
                            : "text-gray-600 hover:text-citolab-700 hover:bg-citolab-50"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Mobile menu button */}
              <div className="ml-auto flex md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-citolab-50 hover:text-citolab-700"
                  onClick={() => setMobileOpen((o) => !o)}
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
          </div>

          {/* Green accent line */}
          <div className="h-0.5 bg-linear-to-r from-citolab-600 via-citolab-teal-500 to-citolab-teal-700" />

          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100">
              <div className="space-y-1 px-3 pb-3 pt-2 bg-white">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-citolab-50 text-citolab-700 border-l-2 border-citolab-600"
                          : "text-gray-600 hover:bg-citolab-50 hover:text-citolab-700"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      ) : null}
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
};
