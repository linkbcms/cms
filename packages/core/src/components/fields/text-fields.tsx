import { Input } from '@linkbcms/ui/components/input';
import { Label } from '@linkbcms/ui/components/label';
import { useStore } from '@tanstack/react-form';
import type { JSX } from 'react/jsx-runtime';
import { useFieldContext } from '../../hooks/form-context.tsx';

export default function TextField({
  label,
}: {
  label: string;
  previousValue: string;
  draft?: {
    value: string;
    updatedAt?: number;
  };
}): JSX.Element {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  // const hasChanged = field.state.value !== previousValue;

  return (
    <div className="relative">
      {/* {hasChanged && (
        <Popover>
          <PopoverTrigger className="-left-4 absolute top-0 h-full">
            <div className="h-full w-1 rounded-md bg-amber-200 dark:bg-amber-100" />
          </PopoverTrigger>
          <PopoverContent>
            <ReactDiffViewer
              hideLineNumbers
              newValue={draft?.value}
              oldValue={previousValue}
              showDiffOnly={false}
              splitView
            />
          </PopoverContent>
        </Popover>
      )} */}

      <div className="flex w-full flex-col items-start gap-2">
        <Label className="flex w-full flex-col items-start gap-2">
          <div>{label}</div>
          <Input
            onChange={(e) => field.handleChange(e.target.value)}
            value={field.state.value}
          />
        </Label>
        {errors.map((error: string) => (
          <div className="text-destructive text-sm" key={error}>
            {error}
          </div>
        ))}
      </div>
    </div>
  );
}
