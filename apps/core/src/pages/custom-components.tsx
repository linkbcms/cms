import { useConfig } from '@/components/config-provider';
import { Memo } from '@legendapp/state/react';
import { useParams } from 'react-router';

export const CustomComponents = () => {
  const { customCollection } = useParams();
  const config = useConfig();

  const collection = customCollection && config.collections?.[customCollection];

  if (!collection) {
    return <div>Collection not found</div>;
  }

  const Component =
    'Component' in collection ? collection.Component : undefined;

  if (!Component?.get()) {
    return <div>Component not found</div>;
  }

  const component = Component.get();

  return <Memo>{component}</Memo>;
};
