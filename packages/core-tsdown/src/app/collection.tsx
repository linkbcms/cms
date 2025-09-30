import { Link, useParams } from 'wouter';
import { m } from '@/paraglide/messages';
import { useConfigContext } from '@/store/use-config.context';

export const CollectionPage = () => {
  const params = useParams();
  const collectionParams = params?.['collection'];
  const config = useConfigContext((s) => s.config);

  const collection = collectionParams
    ? config?.collections?.[collectionParams]
    : undefined;
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="text-2xl capitalize">
          {m.giant_fine_capybara_flip({
            collection: collection?.label || '',
          })}
        </div>

        <Link className={'underline'} to={'/add/new'}>
          {m.such_crisp_lizard_succeed()}
        </Link>
      </div>
    </div>
  );
};
