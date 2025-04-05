import { useConfig } from '@/components/config-provider'
import { useAppForm, withForm } from '@/hooks/form'
import Layout from '@/layout'
import { observable } from '@legendapp/state'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'
import { Memo, use$, useEffectOnce } from '@legendapp/state/react'
import { syncObservable } from '@legendapp/state/sync'
import { toast } from '@linkbcms/ui/components/sonner'
import { useParams } from 'react-router'

import { type V2, formData } from '@/hooks/form-data'
import { formatDistanceToNowStrict } from 'date-fns'

export const CollectionsScreen = () => {
  const { collection: collectionId } = useParams()

  const config = useConfig()

  const collection = collectionId && config.collections?.[collectionId]

  return (
    <Layout>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      {/* <CollectionForm form={form} /> */}
      {/* </Suspense> */}

      <div className='p-5'>
        <h1 className='font-semibold text-2xl'>{collection?.label.get()}</h1>
      </div>
    </Layout>
  )
}

const CollectionForm = withForm({
  render: ({ form }) => {
    const { collection: collectionId } = useParams()
    const config = useConfig()

    const collection = collectionId && config.collections?.[collectionId]

    const store = use$<V2>(formData)

    useEffectOnce(() => {
      if (store.data[`/collections/${collectionId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(store.data[`/collections/${collectionId}`].__updatedAt),
          {
            addSuffix: true,
          }
        )

        requestAnimationFrame(() => {
          toast.info(`Loaded draft from ${lastUpdated}.`)
        })
      }
    }, [])

    if (!collection) {
      return <div>Collection not found</div>
    }

    const collectionSchema = collection.schema.get()

    return (
      <div className='p-5'>
        <form
          className='mx-auto flex max-w-xl flex-col gap-6'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <h1 className='font-semibold text-2xl'>
            <Memo>{collection.label}</Memo>
          </h1>

          <div className='flex w-full flex-col gap-4'>
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
                    })
                  },
                }}>
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
            <form.SubscribeButton label='Submit' />
          </form.AppForm>
        </form>
      </div>
    )
  },
})
