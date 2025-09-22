import { Input } from '@linkbcms/ui/components/input';
import { Label } from '@linkbcms/ui/components/label';
import { useStore } from '@tanstack/react-form';
import type { JSX } from 'react/jsx-runtime';
import { NumericFormat } from 'react-number-format';
import { useFieldContext } from '@/hooks/form-context.tsx';

export default function NumberField({ label }: { label: string }): JSX.Element {
  const field = useFieldContext<number | null>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  // const hasChanged = field.state.value !== previousValue;

  return (
    <div className="relative">
      <div className="flex w-full flex-col items-start gap-2">
        <Label className="flex w-full flex-col items-start gap-2">
          <div>{label}</div>
          <NumericFormat
            customInput={Input}
            onValueChange={(values) =>
              field.handleChange(values.floatValue || null)
            }
            thousandSeparator
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
