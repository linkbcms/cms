import { useParams } from 'wouter';
import { useConfigContext } from '@/store/use-config.context';

export const CustomCollectionPage = () => {
  const config = useConfigContext((s) => s.config);
  const params = useParams();

  const collection = config?.collections?.[params?.['item'] || ''];

  const Component =
    collection && 'Component' in collection ? collection.Component : undefined;

  return <div className="p-5 capitalize">{Component && <Component />}</div>;
};
