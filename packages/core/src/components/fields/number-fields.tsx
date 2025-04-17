import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '@/hooks/form-context.tsx';
import { Label } from '@linkbcms/ui/components/label';
import { Input } from '@linkbcms/ui/components/input';

import type { JSX } from 'react/jsx-runtime';
import { NumericFormat } from 'react-number-format';

export default function NumberField({
  label,
}: {
  label: string;
}): JSX.Element {
  const field = useFieldContext<number | null>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  // const hasChanged = field.state.value !== previousValue;

  return (
    <div className="relative">
      <div className="flex w-full flex-col items-start gap-2">
        <Label className="flex w-full flex-col items-start gap-2">
          <div>{label}</div>
          <NumericFormat
            value={field.state.value}
            customInput={Input}
            thousandSeparator
            onValueChange={(values) =>
              field.handleChange(values.floatValue || null)
            }
          />
        </Label>
        {errors.map((error: string) => (
          <div key={error} className="text-destructive text-sm">
            {error}
          </div>
        ))}
      </div>
    </div>
  );
}
