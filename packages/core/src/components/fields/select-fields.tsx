import { Label } from '@linkbcms/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@linkbcms/ui/components/select';
import { useStore } from '@tanstack/react-form';

import type { JSX } from 'react/jsx-runtime';
import { useFieldContext } from '@/hooks/form-context.tsx';

export default function SelectField({
  label,
  placeholder,
  options,
}: {
  label: string;
  placeholder?: string;
  options: { label: string; value: string }[];
}): JSX.Element {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="relative">
      <div className="flex w-full flex-col items-start gap-2">
        <Label className="flex w-full flex-col items-start gap-2">
          <div>{label}</div>

          <Select
            onValueChange={(values) => {
              values && field.handleChange(values);
            }}
            value={field.state.value}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
