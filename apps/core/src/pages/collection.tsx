import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import Layout from '@/layout';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { Memo, use$, useEffectOnce } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import { toast } from '@linkbcms/ui/components/sonner';
import { useParams, useLocation } from 'react-router';
import pluralize from 'pluralize';

import { type V2, formData } from '@/hooks/form-data';
import { formatDistanceToNowStrict } from 'date-fns';

export const CollectionScreen = () => {
  const { collection: collectionId, item: itemId } = useParams();
  const location = useLocation();

  const isNew = location.pathname.endsWith('/add/new');

  const config = useConfig();

  const collection = collectionId && config.collections?.[collectionId];

  const form = useAppForm({
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

      formData.data[`/collections/${collectionId}`].set({});
    },
  });
  return (
    <Layout>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      {/* <CollectionForm form={form} /> */}
      {/* </Suspense> */}

      <div className="p-5">
        <h1 className="font-semibold text-2xl">
          {isNew ? 'Add New' : 'Edit'}{' '}
          {pluralize.singular(collection?.label.get())}
        </h1>

        <CollectionForm form={form} />
      </div>
    </Layout>
  );
};

const CollectionForm = withForm({
  render: ({ form }) => {
    const { collection: collectionId, item: itemId } = useParams();
    const location = useLocation();
    const isNew = location.pathname.endsWith('/add/new');
    const config = useConfig();

    const collection = collectionId && config.collections?.[collectionId];

    const store = use$<V2>(formData);

    useEffectOnce(() => {
      if (store.data[`/collections/${collectionId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(store.data[`/collections/${collectionId}`].__updatedAt),
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

    const collectionSchema = collection.schema.get();

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
                const label = collection.label.get();
                if (!label) {
                  return '';
                }

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
                  store.data[`/collections/${collectionId}`]?.[key]?.value
                }
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value, signal, fieldApi }) => {
                    formData.data.set({
                      ...store?.data,
                      [`/collections/${collectionId}`]: {
                        ...store?.data?.[`/collections/${collectionId}`],
                        __updatedAt: Date.now(),
                        [key]: {
                          value,
                          updatedAt: Date.now(),
                          previousValue:
                            store?.data?.[`/collections/${collectionId}`]?.[key]
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
                    draft={store.data[`/collections/${collectionId}`]?.[key]}
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
