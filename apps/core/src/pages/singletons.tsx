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

export const SingletonsScreen = () => {
  const { singleton: singletonId } = useParams()
  const form = useAppForm({
    onSubmit({ value, formApi }) {
      toast.success('Data saved.', {
        description: `value: ${JSON.stringify(value, null, 2)}`,
        action: {
          label: 'Test',
          onClick: () => console.log('action: props.action.onClick'),
        },
      })

      // Reset the form to start-over with a clean state
      formApi.reset()

      formData.data[`/singletons/${singletonId}`].set({})
    },
  })

  return (
    <Layout>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <SingletonForm form={form} />
      {/* </Suspense> */}
    </Layout>
  )
}

const SingletonForm = withForm({
  render: ({ form }) => {
    const { singleton: singletonId } = useParams()
    const config = useConfig()

    const singleton = singletonId && config.collections?.[singletonId]

    const store = use$<V2>(formData)

    useEffectOnce(() => {
      if (store.data[`/singletons/${singletonId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(store.data[`/singletons/${singletonId}`].__updatedAt),
          {
            addSuffix: true,
          }
        )

        requestAnimationFrame(() => {
          toast.info(`Loaded draft from ${lastUpdated}.`)
        })
      }
    }, [])

    if (!singleton) {
      return <div>Singleton not found</div>
    }

    const singletonSchema = singleton.schema.get()

    return (
      <div className='p-5'>
        <form
          className='mx-auto flex max-w-xl flex-col gap-6'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <h1 className='font-semibold text-2xl'>
            <Memo>{singleton.label}</Memo>
          </h1>

          <div className='flex w-full flex-col gap-4'>
            {Object.entries(singletonSchema).map(([key, _field]) => (
              <form.AppField
                key={key}
                name={key}
                defaultValue={
                  store.data[`/singletons/${singletonId}`]?.[key]?.value
                }
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value, signal, fieldApi }) => {
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
                    })
                  },
                }}>
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
            <form.SubscribeButton label='Submit' />
          </form.AppForm>
        </form>
      </div>
    )
  },
})
