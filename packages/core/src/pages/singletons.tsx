import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import { use$, useEffectOnce } from '@legendapp/state/react';
import { toast } from '@linkbcms/ui/components/sonner';
import { useParams } from 'react-router';

import { type V2, formData } from '@/hooks/form-data';
import { formatDistanceToNowStrict } from 'date-fns';
import type { SingletonConfig } from '@/index';
import { useMutation, useQuery } from '@tanstack/react-query';

export const SingletonsScreen = () => {
  const { singleton: singletonId } = useParams();

  const store = use$<V2>(formData);

  const query = useQuery({
    queryKey: ['singletons', singletonId],
    queryFn: async () => {
      const res = await fetch(`/api/linkb/${singletonId}`);
      console.log(res);
      if (res.ok) {
        const data = await res.json();
        return data;
      }

      throw new Error('error');
    },
    enabled: !!singletonId,
    retry: false,
  });

  const mutation = useMutation({
    mutationKey: ['singletons', singletonId],
    mutationFn: (value: any) => {
      return fetch(`/api/linkb/${singletonId}`, {
        method: 'POST',
        body: JSON.stringify(value),
      });
    },
    retry: false,
  });

  const isLoading = query.isLoading;

  console.log(query.error);

  const extractValuesFromStore = (data: any) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = (value as any)?.value;
      return acc;
    }, {});
  };

  const isNotEmptyObject = (obj: any) => {
    return obj && Object.keys(obj).length > 0;
  };

  const form = useAppForm({
    defaultValues: isNotEmptyObject(store?.data?.[`/singletons/${singletonId}`])
      ? extractValuesFromStore(store.data[`/singletons/${singletonId}`])
      : query.data?.result?.[0],
    onSubmit({ value }) {
      toast.promise(() => mutation.mutateAsync(value), {
        loading: 'Saving...',
        success: () => {
          // toast.success('Saved');

          formData.data[`/singletons/${singletonId}`].set({});
          return 'Saved';
        },
        error: (error) => {
          console.error(error);
          return 'Failed to save';
        },
      });

      // // Reset the form to start-over with a clean state
      // formApi.reset();

      // formData.data[`/singletons/${singletonId}`].set({});
    },
  });

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && <SingletonForm form={form} key={singletonId} />}
    </>
  );
};

const SingletonForm = withForm({
  render: ({ form }) => {
    const { singleton: singletonId } = useParams();
    const config = useConfig();

    const singleton = use$(
      () => singletonId && config.collections?.[singletonId].get(),
    );

    const store = use$<V2>(formData);

    const query = useQuery({
      queryKey: ['singletons', singletonId],
      queryFn: async () => {
        const res = await fetch(`/api/linkb/${singletonId}`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
        throw new Error('error');
      },
      enabled: !!singletonId,
      retry: false,
    });

    const currentValue = query.data?.result?.[0];

    console.log(currentValue);

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
                name={key}
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
