import { useConfig } from '@/components/config-provider'
import { useAppForm, withForm } from '@/hooks/form'
import Layout from '@/layout'
import type { SingletonConfig } from '@/test/type'
import { Memo } from '@legendapp/state/react'
import { toast } from '@linkbcms/ui/components/sonner'
import { Suspense } from 'react'
import { useParams } from 'react-router'

export const SingletonsScreen = () => {
  const form = useAppForm({
    onSubmit(props) {
      console.log({ props })
      toast(`title: ${props?.value?.title}`, {
        description: `description: ${props?.value?.description}`,
        action: {
          label: 'Test',
          onClick: () => console.log('action: props.action.onClick'),
        },
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
    console.log({ singletonSchema })

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
                children={(field) => <field.TextField label={_field.label} />}
              />
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
