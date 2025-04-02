import { useConfig } from '@/components/config-provider'
import Layout from '@/layout'
import { Memo } from '@legendapp/state/react'
import { useParams } from 'react-router'

export const CustomComponents = () => {
  const { customCollection } = useParams()
  const config = useConfig()

  const collection = customCollection && config.collections?.[customCollection]

  if (!collection) {
    return <div>Collection not found</div>
  }

  const Component =
    'Component' in collection
      ? (collection.Component as unknown as React.ComponentType)
      : undefined

  if (!Component) {
    return <div>Component not found</div>
  }

  return (
    <Layout>
      <Memo>
        <Component />
      </Memo>
    </Layout>
  )
}
