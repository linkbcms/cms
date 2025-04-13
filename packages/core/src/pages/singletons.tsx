import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import { use$, useEffectOnce } from '@legendapp/state/react';
import { toast } from '@linkbcms/ui/components/sonner';
import { useParams } from 'react-router';

import { type V2, formData } from '@/hooks/form-data';
import { formatDistanceToNowStrict } from 'date-fns';
import type { SingletonConfig } from '@/index';

export const SingletonsScreen = () => {
  const { singleton: singletonId } = useParams();

  const store = use$<V2>(formData);

  const form = useAppForm({
    defaultValues: store.data[`/singletons/${singletonId}`],
    onSubmit({ value, formApi }) {
      toast.success('Data saved.', {
        description: `value: ${JSON.stringify(value, null, 2)}`,
        action: {
          label: 'Test',
          onClick: () => console.log('action: props.action.onClick'),
        },
      });

      // Reset the form to start-over with a clean state
      formApi.reset();

      formData.data[`/singletons/${singletonId}`].set({});
    },
  });

  return <SingletonForm form={form} />;
};

const SingletonForm = withForm({
  render: ({ form }) => {
    const { singleton: singletonId } = useParams();
    const config = useConfig();

    const singleton = use$(
      () => singletonId && config.collections?.[singletonId].get(),
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
                name={key + singletonId}
                // defaultValue={
                //   store.data[`/singletons/${singletonId}`]?.[key]?.value
                // }
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
                {(field) => (
                  <field.TextField
                    label={_field.label}
                    previousValue={''}
                    draft={store.data[`/singletons/${singletonId}`]?.[key]}
                  />
                )}
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
