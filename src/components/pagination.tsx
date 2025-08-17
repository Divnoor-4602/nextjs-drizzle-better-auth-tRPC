import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// Legacy props for URL-based pagination
type LegacyProps = {
  page: number;
  pagesCount: number;
  urlPrefix: string;
};

// New props for callback-based pagination
type CallbackProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type Props = LegacyProps | CallbackProps;

function isCallbackProps(props: Props): props is CallbackProps {
  return "currentPage" in props;
}

export function Pagination(props: Props) {
  if (isCallbackProps(props)) {
    // New callback-based pagination
    const { currentPage, totalPages, onPageChange } = props;
    const previousPage = Math.max(0, currentPage - 1);
    const nextPage = Math.min(totalPages - 1, currentPage + 1);

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="ghost"
          onClick={() => onPageChange(previousPage)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="px-4 py-2">
          {currentPage + 1} / {totalPages}
        </span>

        <Button
          variant="ghost"
          onClick={() => onPageChange(nextPage)}
          disabled={currentPage === totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  } else {
    // Legacy URL-based pagination
    const { page, pagesCount, urlPrefix } = props;
    const previousOffset = page === 0 ? 0 : page - 1;
    const nextOffset = page === pagesCount - 1 ? page : page + 1;

    return (
      <>
        {pagesCount !== 0 && (
          <>
            <br />
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href={`${urlPrefix}?page=${previousOffset + 1}`}>
                  <ChevronLeft />
                  Previous
                </Link>
              </Button>
              {page + 1}/{pagesCount}
              <Button variant="ghost" asChild>
                <Link href={`${urlPrefix}page=${nextOffset + 1}`}>
                  <ChevronRight />
                  Next
                </Link>
              </Button>
            </div>
          </>
        )}
      </>
    );
  }
}
