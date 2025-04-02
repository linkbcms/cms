import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context.tsx'
import { Label } from '@linkbcms/ui/components/label'
import { Input } from '@linkbcms/ui/components/input'

export default function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>()

  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className='flex w-full flex-col items-start gap-2'>
      <Label className='flex w-full flex-col items-start gap-2'>
        <div>{label}</div>
        <Input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </Label>
      {errors.map((error: string) => (
        <div key={error} className='text-destructive text-sm'>
          {error}
        </div>
      ))}
    </div>
  )
}
