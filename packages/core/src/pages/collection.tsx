import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import { Memo, use$, useEffectOnce } from '@legendapp/state/react';
import { toast } from '@linkbcms/ui/components/sonner';
import pluralize from 'pluralize';
import { useLocation, useParams } from 'react-router';

import { type V2, formData } from '@/hooks/form-data';
import { formatDistanceToNowStrict } from 'date-fns';
import type { CollectionConfig } from '@/index';
import { useMutation } from '@tanstack/react-query';

export const CollectionScreen = () => {
  const { collection: collectionId, item: itemId } = useParams();

  const store = use$<V2>(formData);

  const location = useLocation();
  const isNew = location.pathname.endsWith('/add/new');

  const mutationCreate = useMutation({
    mutationFn: async (value: any) => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(value),
      });
      return response.json();
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: async (value: any) => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(value),
      });
      return response.json();
    },
  });

  const form = useAppForm({
    defaultValues: store.data[`/collections/${collectionId}/${itemId}`],
    async onSubmit({ value, formApi }) {
      try {
        if (isNew) {
          const result = await mutationCreate.mutateAsync(value);
          console.log(result);
        } else {
          const result = await mutationUpdate.mutateAsync(value);
          console.log(result);
        }
        toast.success('Data saved.', {
          description: `value: ${JSON.stringify(value, null, 2)}`,
          action: {
            label: 'Test',
            onClick: () => console.log('action: props.action.onClick'),
          },
        });
        // Reset the form to start-over with a clean state
        formApi.reset();

        formData.data[`/collections/${collectionId}/${itemId}`].set({});
      } catch (error) {
        toast.error('Failed to save data.', {
          description: `Error: ${error}`,
        });
      }
    },
  });
  return (
    <div className="p-5">
      <CollectionForm form={form} />
    </div>
  );
};

const CollectionForm = withForm({
  render: ({ form }) => {
    const { collection: collectionId, item: itemId } = useParams();
    const location = useLocation();
    const isNew = location.pathname.endsWith('/add/new');
    const config = useConfig();

    const collection = use$(
      () => collectionId && config.collections?.[collectionId].get(),
    );

    const store = use$<V2>(formData);

    useEffectOnce(() => {
      if (store.data[`/collections/${collectionId}/${itemId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(
            store.data[`/collections/${collectionId}/${itemId}`].__updatedAt,
          ),
          {
            addSuffix: true,
          },
        );

        requestAnimationFrame(() => {
          toast.info(`Loaded draft from ${lastUpdated}.`);
        });
      }
    }, []);

    if (!collection) {
      return <div>Collection not found</div>;
    }

    const collectionSchema = (collection as CollectionConfig).schema;

    return (
      <div className="p-5">
        <form
          className="mx-auto flex max-w-xl flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <h1 className="font-semibold text-2xl">
            <Memo>
              {() => {
                const label = (collection as CollectionConfig).label;

                const singularLabel = pluralize.singular(label);

                if (isNew) {
                  return `Add New ${singularLabel}`;
                }
                return `Edit ${singularLabel}`;
              }}
            </Memo>
          </h1>

          <div className="flex w-full flex-col gap-4">
            {Object.entries(collectionSchema).map(([key, _field]) => (
              <form.AppField
                key={key}
                name={key}
                defaultValue={
                  store.data[`/collections/${collectionId}/${itemId}`]?.[key]
                    ?.value
                }
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value }) => {
                    formData.data.set({
                      ...store?.data,
                      [`/collections/${collectionId}`]: {
                        ...store?.data?.[
                          `/collections/${collectionId}/${itemId}`
                        ],
                        __updatedAt: Date.now(),
                        [key]: {
                          value,
                          updatedAt: Date.now(),
                          previousValue:
                            store?.data?.[
                              `/collections/${collectionId}/${itemId}`
                            ]?.[key]?.value || '',
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
                    draft={
                      store.data[`/collections/${collectionId}/${itemId}`]?.[
                        key
                      ]
                    }
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
