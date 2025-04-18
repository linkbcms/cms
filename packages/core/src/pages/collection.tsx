import { useConfig } from '@/components/config-provider';
import { useAppForm, withForm } from '@/hooks/form';
import { Memo, use$ } from '@legendapp/state/react';
import { toast } from '@linkbcms/ui/components/sonner';
import pluralize from 'pluralize';
import { useLocation, useNavigate, useParams } from 'react-router';

import { formData } from '@/hooks/form-data';

import type { CollectionConfig } from '@/index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';
import { useMemo } from 'react';

export const CollectionScreen = (): JSX.Element => {
  const { collection: collectionId, item: itemId } = useParams();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const location = useLocation();
  const isNew = location.pathname.endsWith('/add/new');

  const mutationCreate = useMutation({
    mutationKey: ['collection', collectionId, itemId],
    mutationFn: async (value: any) => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(value),
      });

      if (response.ok) {
        return response.json();
      }

      throw new Error('Failed to create data.');
    },
  });

  const mutationUpdate = useMutation({
    // mutationKey: ['collection', collectionId, itemId],
    mutationFn: async (value: any) => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(value),
      });

      if (response.ok) {
        return response.json();
      }

      throw new Error('Failed to update data.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['collection', collectionId, itemId],
      });
    },
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({
        queryKey: ['collection', collectionId, itemId],
      });

      const previousPosts = queryClient.getQueryData<any>([
        'collection',
        collectionId,
        itemId,
      ]);

      queryClient.setQueryData(
        ['collection', collectionId, itemId],
        (old: any) => {
          return {
            ...old,
            result: {
              ...old.result,
              ...newPost,
            },
          };
        },
      );

      return previousPosts;
    },
  });

  const query = useQuery({
    queryKey: ['collection', collectionId, itemId],
    queryFn: async () => {
      const response = await fetch(`/api/linkb/${collectionId}/${itemId}`);

      if (response.ok) {
        return response.json();
      }

      throw new Error('Failed to fetch data.');
    },
  });

  const result = query.data?.result;

  const isLoading = query.isLoading;

  const updatedValue = useMemo(
    () =>
      result && itemId
        ? Object.entries(result).reduce((acc, [key, value]) => {
            const newKey = `${key}/${itemId}`;

            if (newKey) {
              acc[newKey] = value;
            }
            return acc;
          }, {})
        : undefined,
    [result, itemId],
  );

  const form = useAppForm({
    defaultValues: updatedValue,
    async onSubmit({ value, formApi }) {
      const updatedValue = Object.entries(value).reduce((acc, [key, value]) => {
        const newKey = key.split('/')[0];

        if (newKey) {
          acc[newKey] = value;
        }
        return acc;
      }, {});

      try {
        if (isNew) {
          const result = await mutationCreate.mutateAsync(updatedValue);
          const newId = result?.result?.[0]?.id;

          if (newId) {
            navigate(`/collections/${collectionId}/${newId}`);
            toast.success('Data saved.', {
              description: `value: ${JSON.stringify(updatedValue, null, 2)}`,
            });
            // Reset the form to start-over with a clean state
            formApi.reset();

            formData.data[`/collections/${collectionId}/${itemId}`]?.set({});
          } else {
            throw new Error('Failed to save data.');
          }
        } else {
          await mutationUpdate.mutateAsync(updatedValue);

          toast.success('Data saved.', {
            description: `value: ${JSON.stringify(updatedValue, null, 2)}`,
            action: {
              label: 'Test',
              onClick: () => console.log('action: props.action.onClick'),
            },
          });
          // Reset the form to start-over with a clean state
          formApi.reset();

          formData.data[`/collections/${collectionId}/${itemId}`]?.set({});
        }
      } catch (error) {
        toast.error('Failed to save data.', {
          description: `Error: ${error}`,
        });
      }
    },
  });
  return (
    <div className="p-5">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <CollectionForm form={form} />
      )}
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
      () => collectionId && config.collections?.[collectionId]?.get(),
    );

    if (!collection) {
      return <div>Collection not found</div>;
    }

    const collectionSchema = (collection as CollectionConfig).schema;

    const schemaFields = Object.entries(collectionSchema);

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
            {schemaFields.map(([key, _field]) =>
              _field.type === 'select' ? (
                <form.AppField key={key + itemId} name={`${key}/${itemId}`}>
                  {(field) => {
                    return (
                      <field.SelectField
                        label={_field.label}
                        options={_field.options}
                        placeholder={_field.placeholder}
                      />
                    );
                  }}
                </form.AppField>
              ) : _field.type === 'number' ? (
                <form.AppField key={key + itemId} name={`${key}/${itemId}`}>
                  {(field) => {
                    return <field.NumberField label={_field.label} />;
                  }}
                </form.AppField>
              ) : (
                <form.AppField key={key + itemId} name={`${key}/${itemId}`}>
                  {(field) => <field.TextField label={_field.label} />}
                </form.AppField>
              ),
            )}
          </div>

          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    );
  },
});
