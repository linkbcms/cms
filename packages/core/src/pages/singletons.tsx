import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import { use$, useEffectOnce } from '@legendapp/state/react';
import { toast } from '@linkbcms/ui/components/sonner';
import { useParams } from 'react-router';

import { type V2, formData } from '@/hooks/form-data';
import { formatDistanceToNowStrict } from 'date-fns';
import type { SingletonConfig } from '@/index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JSX } from 'react/jsx-runtime';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

// console.log(query.error);

const extractValuesFromStore = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = (value as any)?.value;
    return acc;
  }, {});
};

const isNotEmptyObject = (obj: any) => {
  return obj && Object.keys(obj).length > 0;
};

export const SingletonsScreen = (): JSX.Element => {
  const { singleton: singletonId } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['singletons', singletonId],
    queryFn: async () => {
      const res = await fetch(`/api/linkb/${singletonId}/1`, {
        method: 'GET',
      });
      const data = await res.json();
      return data;
    },
  });

  const mutation = useMutation({
    mutationKey: ['singletons', singletonId],
    mutationFn: async (value: any) => {
      const hasData = query.data?.result;

      const res = await fetch(
        `/api/linkb/${singletonId}${hasData ? '/1' : ''}`,
        {
          method: hasData ? 'PATCH' : 'POST',
          body: JSON.stringify(value),
        },
      );

      const result = await res.json();

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singletons', singletonId] });
    },
  });

  const isLoading = query.isLoading;

  const updatedValue = useMemo(
    () =>
      query.data?.result
        ? Object.entries(query.data?.result).reduce((acc, [key, value]) => {
            const newKey = `${key}/${singletonId}`;

            if (newKey) {
              acc[newKey] = value;
            }
            return acc;
          }, {})
        : undefined,
    [query.data?.result, singletonId],
  );

  const form = useAppForm({
    // defaultValues: isNotEmptyObject(store?.data?.[`/singletons/${singletonId}`])
    //   ? extractValuesFromStore(store.data[`/singletons/${singletonId}`])
    //   : query.data?.result?.[0],

    defaultValues: updatedValue,
    onSubmit({ value }) {
      console.log({ value });

      const updatedValue = Object.entries(value).reduce((acc, [key, value]) => {
        const newKey = key.split('/')[0];

        if (newKey) {
          acc[newKey] = value;
        }
        return acc;
      }, {});

      toast.promise(() => mutation.mutateAsync(updatedValue), {
        loading: 'Saving...',
        success: () => {
          // toast.success('Saved');

          formData.data[`/singletons/${singletonId}`]?.set({});
          return 'Saved';
        },
        error: (error) => {
          console.error(error);
          return 'Failed to save';
        },
      });
    },
  });

  return (
    <>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <SingletonForm
          form={form}
          key={singletonId}
          currentValue={updatedValue}
        />
      )}
    </>
  );
};

const SingletonForm = withForm({
  render: ({ form, currentValue }) => {
    const { singleton: singletonId } = useParams();
    const config = useConfig();

    const singleton = use$(
      () => singletonId && config.collections?.[singletonId]?.get(),
    );

    const store = use$<V2>(formData);

    useEffectOnce(() => {
      if (store.data[`/singletons/${singletonId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(store.data[`/singletons/${singletonId}`].__updatedAt),
          {
            addSuffix: true,
          },
        );

        requestAnimationFrame(() => {
          toast.info(`Loaded draft from ${lastUpdated}.`);
        });
      }
    }, []);

    const singletonSchema = (singleton as SingletonConfig)?.schema;

    const schemaFields = Object.entries(singletonSchema);

    if (!singleton) {
      return <div>Singleton not found</div>;
    }
    return (
      <div className="p-5">
        <form
          className="mx-auto flex max-w-xl flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <h1 className="font-semibold text-2xl">{singleton.label}</h1>

          <div className="flex w-full flex-col gap-4">
            {schemaFields.map(([key, _field]) => (
              <form.AppField
                key={key + singletonId}
                name={`${key}/${singletonId}`}
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value }) => {
                    formData.data.set({
                      ...store?.data,
                      [`/singletons/${singletonId}`]: {
                        ...store?.data?.[`/singletons/${singletonId}`],
                        __updatedAt: Date.now(),
                        [key]: {
                          value,
                          updatedAt: Date.now(),
                          previousValue:
                            store?.data?.[`/singletons/${singletonId}`]?.[key]
                              ?.value || '',
                        },
                      },
                    });
                  },
                }}
              >
                {(field) => {
                  return (
                    <field.TextField
                      label={_field.label}
                      previousValue={currentValue?.[key]}
                      draft={
                        store?.data?.[`/singletons/${singletonId}`]?.[key] || {
                          value: currentValue?.[key],
                        }
                      }
                    />
                  );
                }}
              </form.AppField>
            ))}
          </div>

          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    );
  },
});
