import {
  createFormHookContexts,
  type FieldApi,
  type AnyFieldApi,
  type AnyFormApi,
  type ReactFormExtendedApi,
} from '@tanstack/react-form';
import type { Context } from 'react';

const dest = createFormHookContexts();
export const fieldContext: Context<AnyFieldApi> = dest.fieldContext;
export const useFieldContext: <TData>() => FieldApi<
  any,
  string,
  TData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> = dest.useFieldContext;
export const formContext: Context<AnyFormApi> = dest.formContext;
export const useFormContext: () => ReactFormExtendedApi<
  Record<string, never>,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> = dest.useFormContext;
