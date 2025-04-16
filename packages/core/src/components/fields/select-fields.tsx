import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '@/hooks/form-context.tsx';
import { Label } from '@linkbcms/ui/components/label';

import type { JSX } from 'react/jsx-runtime';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@linkbcms/ui/components/select';

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
            value={field.state.value}
            onValueChange={(values) => {
              values && field.handleChange(values);
            }}
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
          <div key={error} className="text-destructive text-sm">
            {error}
          </div>
        ))}
      </div>
    </div>
  );
}
