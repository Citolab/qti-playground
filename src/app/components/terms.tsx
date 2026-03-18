import { ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Terms() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 py-2">
          <ScrollText className="w-3 h-3" />
          Terms and Conditions
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex">
            <span className="font-medium mr-2">1.</span>
            <p>
              Local Processing: All file processing occurs entirely within your
              browser. Your files are not uploaded to any server and remain on
              your device.
            </p>
          </div>
          <div className="flex">
            <span className="font-medium mr-2">2.</span>
            <p>
              Browser Security: While we do not collect your data, we cannot
              protect against malicious browser extensions or plugins that may
              access content within your browser. Use this tool in a secure
              browser environment.
            </p>
          </div>
          <div className="flex">
            <span className="font-medium mr-2">3.</span>
            <p>
              Session Storage: Your files and converted content are temporarily
              stored in your browser's memory and local storage. This data will
              be cleared when you close your browser or clear your browser data.
            </p>
          </div>
          <div className="flex">
            <span className="font-medium mr-2">4.</span>
            <p>
              No Warranty: This tool is provided "as is" without warranty of any
              kind. We are not responsible for any data loss, corruption, or
              other issues that may arise from using this tool.
            </p>
          </div>
          <div className="flex">
            <span className="font-medium mr-2">5.</span>
            <p>
              Acceptance: By previewing a file, you acknowledge that you have
              read, understood, and agreed to these terms and conditions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
