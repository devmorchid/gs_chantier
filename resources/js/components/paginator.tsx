import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatorProps {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    onPageChange: (page: number) => void;
}

export function Paginator({ current_page, last_page, from, to, total, onPageChange }: PaginatorProps) {
    if (last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
                {from ?? 0} – {to ?? 0} sur {total} résultats
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-3">
                    {current_page} / {last_page}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={current_page === last_page}
                    onClick={() => onPageChange(current_page + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
