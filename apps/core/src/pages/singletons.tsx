import { useConfig } from '@/components/config-provider'
import { useAppForm, withForm } from '@/hooks/form'
import Layout from '@/layout'
import type { SingletonConfig } from '@/test/type'
import { Memo, useEffectOnce } from '@legendapp/state/react'
import { toast } from '@linkbcms/ui/components/sonner'
import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router'
import { observable } from '@legendapp/state'
import { use$ } from '@legendapp/state/react'
import { configureSynced, syncObservable } from '@legendapp/state/sync'
import { syncedFetch } from '@legendapp/state/sync-plugins/fetch'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns'

interface V1 {
  version: number
  updatedAt: number
  data: { [x: string]: any }
}
interface V2 {
  version: number
  updatedAt: number
  data: { [x: string]: any }
}
const obs = observable<V2>({ version: 2, updatedAt: 0, data: {} })
// Persist the observable to the named key of the global persist plugin
syncObservable(obs, {
  persist: {
    name: 'form-data',
    plugin: ObservablePersistLocalStorage,
  },
})

export const SingletonsScreen = () => {
  const { singleton: singletonId } = useParams()
  const form = useAppForm({
    onSubmit({ value, formApi }) {
      toast('Data saved.', {
        description: `value: ${JSON.stringify(value, null, 2)}`,
        action: {
          label: 'Test',
          onClick: () => console.log('action: props.action.onClick'),
        },
      })

      // Reset the form to start-over with a clean state
      formApi.reset()

      obs.data.set({
        ...obs.data,
        [`/singletons/${singletonId}`]: null,
      })
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

    if (!singleton) {
      return <div>Singleton not found</div>
    }

    const singletonSchema = singleton.schema.get()

    const store = use$<V2>(obs)

    useEffectOnce(() => {
      console.log('store', store.data)
      if (store.data[`/singletons/${singletonId}`]?.__updatedAt) {
        const lastUpdated = formatDistanceToNowStrict(
          new Date(store.data[`/singletons/${singletonId}`].__updatedAt),
          {
            addSuffix: true,
          }
        )

        requestAnimationFrame(() => {
          toast(`Loaded draft from ${lastUpdated}.`)
        })
      }
    }, [])

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
                    obs.data.set({
                      ...store.data,
                      [`/singletons/${singletonId}`]: {
                        ...store.data[`/singletons/${singletonId}`],
                        __updatedAt: Date.now(),
                        [key]: { value, updatedAt: Date.now() },
                      },
                    })
                  },
                }}>
                {(field) => <field.TextField label={_field.label} />}
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
