import { ArrowRight, LibraryBig, PenLine, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { ExampleGallery } from "../examples/example-gallery";

export function ExamplesPage() {
  return (
    <PageShell
      icon={LibraryBig}
      title="Examples"
      description="Ready-made QTI 3 tests. Play them in the player, or browse their items and open one in the editor."
    >
      <ExampleGallery />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Link
          to="/package"
          className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-citolab-600"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citolab-50 text-citolab-700">
            <Upload className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-display text-base font-semibold text-gray-900">
              Play your own package
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              Drop in a QTI 2.x or QTI 3 ZIP. It is converted and played
              entirely in your browser.
            </span>
          </span>
        </Link>
        <Link
          to="/edit"
          className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-citolab-600"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citolab-50 text-citolab-700">
            <PenLine className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-display text-base font-semibold text-gray-900">
              Write an item from scratch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              Build a QTI 3 item visually and watch the XML being written as
              you type.
            </span>
          </span>
        </Link>
      </div>
    </PageShell>
  );
}

export default ExamplesPage;
